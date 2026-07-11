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
from app.messaging.channels.facebook_client import FacebookClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/facebook", tags=["webhooks", "facebook"])

@router.get("")
async def verify_webhook(request: Request):
    """
    Webhook verification for Meta Graph API (Messenger).
    Meta sends a GET request to verify the webhook URL.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    # In a real app, verify_token should match the one configured in the Meta App
    if mode == "subscribe" and token:
        logger.info(f"Facebook Webhook verified with token: {token}")
        return Response(content=challenge, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Invalid verification token")

@router.post("")
async def receive_message(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Receive incoming messages and status updates from Meta Graph API.
    """
    try:
        body = await request.json()
        logger.info(f"Received Facebook webhook payload: {body}")
        
        if body.get("object") != "page":
            return Response(status_code=404)

        for entry in body.get("entry", []):
            page_id = entry.get("id")
            
            for messaging_event in entry.get("messaging", []):
                if "message" not in messaging_event:
                    continue
                    
                sender_psid = messaging_event["sender"]["id"]
                recipient_psid = messaging_event["recipient"]["id"]
                message_text = messaging_event["message"].get("text", "")
                
                logger.info(f"New Facebook Message from {sender_psid} to {page_id}: {message_text}")
                
                # 1. Find the inbox configured for this page_id
                inbox_stmt = select(Inbox).where(
                    Inbox.channel_type == "facebook",
                    Inbox.channel_config.op('->>')('pageId') == str(page_id)
                ).limit(1)
                inbox_res = await db.execute(inbox_stmt)
                inbox = inbox_res.scalar_one_or_none()
                
                # Fallback to any active facebook inbox if page_id match fails (for simple CRM usage)
                if not inbox:
                    inbox_res = await db.execute(select(Inbox).where(Inbox.channel_type == "facebook").limit(1))
                    inbox = inbox_res.scalar_one_or_none()
                
                if not inbox:
                    logger.error(f"No Facebook inbox found for page ID: {page_id}.")
                    continue
                    
                # 2. Find or create Contact
                contact_stmt = select(Contact).where(
                    Contact.custom_data.op('->>')('facebook_psid') == str(sender_psid), 
                    Contact.tenant_id == inbox.tenant_id
                ).limit(1)
                contact_res = await db.execute(contact_stmt)
                contact = contact_res.scalar_one_or_none()
                
                if not contact:
                    contact = Contact(
                        tenant_id=inbox.tenant_id,
                        first_name="Facebook User",
                        source="facebook",
                        custom_data={"facebook_psid": sender_psid}
                    )
                    db.add(contact)
                    await db.flush()
                    
                # 3. Find or create Conversation
                conv_stmt = select(Conversation).where(
                    Conversation.contact_id == contact.id,
                    Conversation.inbox_id == inbox.id,
                    Conversation.status == "open"
                ).limit(1)
                conv_res = await db.execute(conv_stmt)
                conversation = conv_res.scalar_one_or_none()
                
                if not conversation:
                    conversation = Conversation(
                        tenant_id=inbox.tenant_id,
                        contact_id=contact.id,
                        inbox_id=inbox.id,
                        status="open",
                        channel_metadata={"sender_psid": sender_psid}
                    )
                    db.add(conversation)
                    await db.flush()
                    
                # 4. Save Message
                msg = Message(
                    tenant_id=inbox.tenant_id,
                    conversation_id=conversation.id,
                    sender_type="contact",
                    content=message_text,
                    source="facebook"
                )
                db.add(msg)
                await db.commit()
                
                # 5. Broadcast via WebSocket
                await manager.broadcast_to_tenant(inbox.tenant_id, {
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
                    tenant_id=inbox.tenant_id,
                    event_type="message_received",
                    context={
                        "contact_id": str(contact.id),
                        "conversation_id": str(conversation.id),
                        "source": "facebook"
                    }
                )
                
                # 6. Trigger AI
                ai_service = AIService(db)
                ai_reply = await ai_service.generate_reply(conversation.id, inbox.tenant_id, inbox.id)
                
                if ai_reply:
                    logger.info(f"AI Generated Reply: {ai_reply}")
                    
                    access_token = inbox.channel_config.get("accessToken", os.getenv("FACEBOOK_ACCESS_TOKEN", ""))
                    client = FacebookClient(access_token, page_id=page_id)
                    success = await client.send_text_message(sender_psid, ai_reply)
                    
                    if success:
                        # Save AI message to DB
                        ai_msg = Message(
                            tenant_id=inbox.tenant_id,
                            conversation_id=conversation.id,
                            sender_type="ai_agent",
                            content=ai_reply,
                            source="platform"
                        )
                        db.add(ai_msg)
                        await db.commit()
                        
                        # Broadcast AI reply
                        await manager.broadcast_to_tenant(inbox.tenant_id, {
                            "event": "new_message",
                            "message": {
                                "id": str(ai_msg.id),
                                "conversation_id": str(ai_msg.conversation_id),
                                "content": ai_msg.content,
                                "sender_type": ai_msg.sender_type,
                                "created_at": str(ai_msg.created_at)
                            }
                        })

        return Response(content="EVENT_RECEIVED", status_code=200)

    except Exception as e:
        logger.error(f"Error processing Facebook webhook: {e}")
        return Response(status_code=500)
