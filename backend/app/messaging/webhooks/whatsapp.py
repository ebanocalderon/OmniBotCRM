from fastapi import APIRouter, Request, Response, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import os

from app.core.database import get_db
from app.core.config import get_settings
from app.messaging.models import Inbox, Conversation, Message
from app.crm.models import Contact
from app.ai.service import AIService
from app.messaging.channels.whatsapp_client import WhatsAppClient
from sqlalchemy import select

from app.automations.service import AutomationEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/whatsapp", tags=["webhooks", "whatsapp"])

@router.get("")
async def verify_webhook(request: Request):
    """
    Webhook verification for Meta WhatsApp Cloud API.
    Meta sends a GET request to verify the webhook URL.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    # For a real implementation, you would store/validate the verify_token
    # For now, we will accept any token or use a standard one.
    if mode == "subscribe" and token:
        logger.info(f"WhatsApp Webhook verified for token: {token}")
        return Response(content=challenge, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Invalid verification token")

@router.post("")
async def receive_message(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Receive incoming messages and status updates from WhatsApp Cloud API.
    """
    try:
        body = await request.json()
        logger.info(f"Received WhatsApp webhook payload: {body}")
        
        if body.get("object") != "whatsapp_business_account":
            return Response(status_code=404)

        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                
                # Check if it's a message
                if "messages" in value:
                    for message in value["messages"]:
                        from_number = message.get("from")
                        message_id = message.get("id")
                        msg_type = message.get("type")
                        text_body = message.get("text", {}).get("body", "")
                        
                        logger.info(f"New WhatsApp Message from {from_number} (Type: {msg_type}): {text_body}")
                        
                        metadata = value.get("metadata", {})
                        phone_number_id = metadata.get("phone_number_id")
                        
                        # 1. Find the inbox
                        # For simplicity, we assume an inbox exists with this channel type. In a real app we'd filter by phone_number_id in channel_config.
                        inbox_stmt = select(Inbox).where(Inbox.channel_type == "whatsapp").limit(1)
                        inbox_res = await db.execute(inbox_stmt)
                        inbox = inbox_res.scalar_one_or_none()
                        
                        if not inbox:
                            logger.error("No WhatsApp inbox found to route message.")
                            continue
                            
                        # 2. Find or create Contact
                        contact_stmt = select(Contact).where(Contact.phone == from_number, Contact.tenant_id == inbox.tenant_id).limit(1)
                        contact_res = await db.execute(contact_stmt)
                        contact = contact_res.scalar_one_or_none()
                        
                        if not contact:
                            contact = Contact(
                                tenant_id=inbox.tenant_id,
                                phone=from_number,
                                first_name="WhatsApp User",
                                source="whatsapp"
                            )
                            db.add(contact)
                            await db.flush() # flush to get ID
                            
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
                                status="open"
                            )
                            db.add(conversation)
                            await db.flush()
                            
                        # 4. Save Message
                        msg = Message(
                            tenant_id=inbox.tenant_id,
                            conversation_id=conversation.id,
                            sender_type="contact",
                            content=text_body,
                            source="whatsapp"
                        )
                        db.add(msg)
                        await db.commit()
                        
                        # Trigger automations
                        auto_engine = AutomationEngine(db)
                        await auto_engine.trigger_event(
                            tenant_id=inbox.tenant_id,
                            event_type="message_received",
                            context={
                                "contact_id": str(contact.id),
                                "conversation_id": str(conversation.id),
                                "source": "whatsapp"
                            }
                        )
                        
                        # 5. Trigger AI asynchronously (or synchronously for simplicity here)
                        ai_service = AIService(db)
                        ai_reply = await ai_service.generate_reply(conversation.id, inbox.tenant_id, inbox.id)
                        
                        if ai_reply:
                            logger.info(f"AI Generated Reply: {ai_reply}")
                            
                            # Send via Meta API
                            whatsapp_token = inbox.channel_config.get("access_token", os.getenv("WHATSAPP_TOKEN", ""))
                            client = WhatsAppClient(token=whatsapp_token, phone_number_id=phone_number_id)
                            success = await client.send_text_message(from_number, ai_reply)
                            
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
                                
                elif "statuses" in value:
                    # Message delivery status updates (sent, delivered, read, failed)
                    pass
                    
        return Response(content="EVENT_RECEIVED", status_code=200)

    except Exception as e:
        logger.error(f"Error processing WhatsApp webhook: {e}")
        return Response(status_code=500)
