from fastapi import APIRouter, Request, Response, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
import os

from app.core.database import get_db
from app.messaging.models import Inbox, Conversation, Message
from app.crm.models import Contact
from app.ai.service import AIService
from app.automations.service import AutomationEngine
from app.messaging.websocket import manager
from app.messaging.drivers.chatwoot.client import ChatwootClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chatwoot", tags=["webhooks", "chatwoot"])

@router.post("")
async def receive_chatwoot_event(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Receive webhook events from Chatwoot.
    """
    try:
        body = await request.json()
        logger.info(f"Received Chatwoot webhook payload: {body.get('event')}")
        
        # We only care about incoming messages
        if body.get("event") != "message_created" or body.get("message_type") != "incoming":
            return Response(content="IGNORED", status_code=200)

        cw_conv_id = body.get("conversation", {}).get("id")
        content = body.get("content", "")
        sender = body.get("sender", {})
        
        sender_name = sender.get("name", "Unknown")
        sender_email = sender.get("email")
        sender_phone = sender.get("phone_number")
        
        # In a multi-tenant environment, the webhook URL might include the tenant_id 
        # or we could identify the tenant via an inbox configuration that maps to the Chatwoot account/inbox.
        # For simplicity in this CRM clone, we assume the default tenant or query by channel_type.
        inbox_stmt = select(Inbox).where(Inbox.channel_type == "chatwoot").limit(1)
        inbox_res = await db.execute(inbox_stmt)
        inbox = inbox_res.scalar_one_or_none()
        
        if not inbox:
            logger.error("No Chatwoot inbox found to route message.")
            return Response(status_code=404)
            
        tenant_id = inbox.tenant_id
        
        # 1. Find or create Contact (try email, then phone, fallback to generic)
        contact = None
        if sender_email:
            contact_res = await db.execute(select(Contact).where(Contact.email == sender_email, Contact.tenant_id == tenant_id).limit(1))
            contact = contact_res.scalar_one_or_none()
            
        if not contact and sender_phone:
            contact_res = await db.execute(select(Contact).where(Contact.phone == sender_phone, Contact.tenant_id == tenant_id).limit(1))
            contact = contact_res.scalar_one_or_none()
            
        if not contact:
            # Create a new contact
            contact = Contact(
                tenant_id=tenant_id,
                first_name=sender_name,
                email=sender_email,
                phone=sender_phone,
                source="chatwoot"
            )
            db.add(contact)
            await db.flush()
            
        # 2. Find or create Conversation
        # We use channel_metadata to store the Chatwoot conversation ID so we can reply back to the exact thread
        conv_stmt = select(Conversation).where(
            Conversation.contact_id == contact.id,
            Conversation.inbox_id == inbox.id,
            Conversation.channel_metadata.op('->>')('chatwoot_conversation_id') == str(cw_conv_id)
        ).limit(1)
        conv_res = await db.execute(conv_stmt)
        conversation = conv_res.scalar_one_or_none()
        
        if not conversation:
            conversation = Conversation(
                tenant_id=tenant_id,
                contact_id=contact.id,
                inbox_id=inbox.id,
                status="open",
                channel_metadata={"chatwoot_conversation_id": cw_conv_id}
            )
            db.add(conversation)
            await db.flush()
            
        # 3. Save Message
        msg = Message(
            tenant_id=tenant_id,
            conversation_id=conversation.id,
            sender_type="contact",
            content=content,
            source="chatwoot"
        )
        db.add(msg)
        await db.commit()
        
        # 4. Broadcast via WebSocket
        await manager.broadcast_to_tenant(tenant_id, {
            "event": "new_message",
            "message": {
                "id": str(msg.id),
                "conversation_id": str(msg.conversation_id),
                "content": msg.content,
                "sender_type": msg.sender_type,
                "created_at": str(msg.created_at)
            }
        })
        
        # Trigger automations
        auto_engine = AutomationEngine(db)
        await auto_engine.trigger_event(
            tenant_id=tenant_id,
            event_type="message_received",
            context={
                "contact_id": str(contact.id),
                "conversation_id": str(conversation.id),
                "source": "chatwoot"
            }
        )
        
        # 5. Trigger AI
        ai_service = AIService(db)
        ai_reply = await ai_service.generate_reply(conversation.id, tenant_id, inbox.id)
        
        if ai_reply:
            logger.info(f"AI Generated Reply: {ai_reply}")
            
            cw_base_url = os.getenv("CHATWOOT_BASE_URL", "http://localhost:3000")
            cw_api_token = os.getenv("CHATWOOT_API_TOKEN", "")
            cw_account_id = os.getenv("CHATWOOT_ACCOUNT_ID", "1")
            
            client = ChatwootClient(cw_base_url, cw_api_token, cw_account_id)
            success = await client.send_message(cw_conv_id, ai_reply)
            
            if success:
                # Save AI message to DB
                ai_msg = Message(
                    tenant_id=tenant_id,
                    conversation_id=conversation.id,
                    sender_type="ai_agent",
                    content=ai_reply,
                    source="platform"
                )
                db.add(ai_msg)
                await db.commit()
                
                # Broadcast AI reply
                await manager.broadcast_to_tenant(tenant_id, {
                    "event": "new_message",
                    "message": {
                        "id": str(ai_msg.id),
                        "conversation_id": str(ai_msg.conversation_id),
                        "content": ai_msg.content,
                        "sender_type": ai_msg.sender_type,
                        "created_at": str(ai_msg.created_at)
                    }
                })

        return Response(content="OK", status_code=200)

    except Exception as e:
        logger.error(f"Error processing Chatwoot webhook: {e}")
        return Response(status_code=500)
