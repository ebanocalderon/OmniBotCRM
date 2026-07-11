from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, status, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

async def process_ai_reply(tenant_id: UUID, conversation_id: UUID, inbox_id: UUID, db_session):
    from app.ai.service import AIService
    from app.messaging.websocket import manager
    service = AIService(db_session)
    reply = await service.generate_reply(conversation_id, tenant_id, inbox_id)
    
    if reply:
        # Save AI reply to DB
        from app.messaging.service import MessagingService
        from app.messaging.schemas import MessageCreate
        msg_svc = MessagingService(db_session)
        ai_msg = await msg_svc.create_message(tenant_id, MessageCreate(
            conversation_id=conversation_id,
            content=reply,
            sender_type="ai_agent"
        ))
        
        # Broadcast the AI reply
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

from app.core.database import get_db
from app.core.security import get_current_user
from app.tenants.models import User
from app.messaging.schemas import (
    InboxCreate, InboxUpdate, InboxResponse,
    ConversationCreate, ConversationUpdate, ConversationResponse,
    MessageCreate, MessageResponse
)
from app.messaging.service import MessagingService
from app.messaging.websocket import manager
from app.messaging.webhooks.whatsapp import router as whatsapp_router
from app.messaging.webhooks.meta import router as meta_webhook_router
from app.messaging.channels.sms_twilio import TwilioSMSDriver
from app.messaging.channels.voice_twilio import TwilioVoiceDriver
from app.messaging.channels.email_smtp import SMTPEmailDriver

router = APIRouter(prefix="/messaging", tags=["messaging"])
router.include_router(whatsapp_router, prefix="/webhooks")
router.include_router(meta_webhook_router, prefix="/webhooks")

def get_messaging_service(db: AsyncSession = Depends(get_db)) -> MessagingService:
    return MessagingService(db)

@router.websocket("/ws/{tenant_id}")
async def websocket_endpoint(websocket: WebSocket, tenant_id: UUID):
    await manager.connect(websocket, tenant_id)
    try:
        while True:
            # We don't expect messages from client via WS for now, but keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, tenant_id)

# --- Inboxes ---

@router.get("/inboxes", response_model=List[InboxResponse])
async def list_inboxes(
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.list_inboxes(current_user.tenant_id)

@router.post("/inboxes", response_model=InboxResponse, status_code=status.HTTP_201_CREATED)
async def create_inbox(
    data: InboxCreate,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.create_inbox(current_user.tenant_id, data)

@router.get("/inboxes/{inbox_id}", response_model=InboxResponse)
async def get_inbox(
    inbox_id: UUID,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.get_inbox(inbox_id, current_user.tenant_id)

@router.patch("/inboxes/{inbox_id}", response_model=InboxResponse)
async def update_inbox(
    inbox_id: UUID,
    data: InboxUpdate,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.update_inbox(inbox_id, current_user.tenant_id, data)

# --- Conversations ---

@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.list_conversations(current_user.tenant_id, limit, offset)

@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.create_conversation(current_user.tenant_id, data)

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.get_conversation(conversation_id, current_user.tenant_id)

@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: UUID,
    data: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.update_conversation(conversation_id, current_user.tenant_id, data)

# --- Messages ---

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def list_messages(
    conversation_id: UUID,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    return await service.list_messages(conversation_id, current_user.tenant_id, limit)

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    conversation_id: UUID,
    data: MessageCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service),
    db: AsyncSession = Depends(get_db)
):
    # Verify conversation exists and get inbox
    conv = await service.get_conversation(conversation_id, current_user.tenant_id)
    inbox = await service.get_inbox(conv.inbox_id, current_user.tenant_id)
    
    # 1. Delegate to the correct channel driver before saving to DB
    if inbox.channel_type == "sms":
        driver = TwilioSMSDriver(inbox.channel_config)
        # Assuming contact phone is stored in conv.contact.phone
        to_number = conv.contact.phone
        if to_number:
            result = await driver.send_message(to_number, data.content)
            data.channel_metadata = result
    
    elif inbox.channel_type == "email":
        driver = SMTPEmailDriver(inbox.channel_config)
        to_email = conv.contact.email
        if to_email:
            result = await driver.send_email(to_email, "Re: Support", html_body=data.content)
            data.channel_metadata = result
            
    elif inbox.channel_type == "meta":
        import os
        from app.messaging.channels.meta_client import MetaClient
        
        # In a real setup, channel_config would contain the token for this specific inbox/page
        page_access_token = inbox.channel_config.get("accessToken", os.getenv("META_ACCESS_TOKEN", ""))
        
        client = MetaClient(page_access_token)
        
        # Get the PSID (Page-Scoped ID) or IGSID of the user from the conversation metadata
        recipient_psid = conv.channel_metadata.get("meta_psid")
        if recipient_psid:
            result = await client.send_text_message(recipient_psid, data.content)
            data.channel_metadata = result

    # 2. Save to DB
    data.conversation_id = conversation_id
    new_message = await service.create_message(current_user.tenant_id, data)
    
    # 3. Broadcast over WebSocket
    await manager.broadcast_to_tenant(current_user.tenant_id, {
        "event": "new_message",
        "message": {
            "id": str(new_message.id),
            "conversation_id": str(new_message.conversation_id),
            "content": new_message.content,
            "sender_type": new_message.sender_type,
            "created_at": str(new_message.created_at)
        }
    })
    
    # 4. Trigger AI if sender is user/customer
    if data.sender_type == "user":
        # Pass a fresh session or the existing one? FastAPI BackgroundTasks with SQLAlchemy AsyncSession is tricky.
        # Actually, using the same session might fail if it's closed, but Depends(get_db) keeps it alive until background task finishes in FastAPI.
        background_tasks.add_task(process_ai_reply, current_user.tenant_id, conversation_id, inbox.id, db)
    
    return new_message

# --- Webhooks & Voice ---

@router.post("/webhooks/twilio/sms")
async def twilio_sms_webhook(
    # Twilio sends Form data, but we can capture it directly or via Request
    # Simplified for the plan
):
    return {"status": "received"}

@router.post("/webhooks/twilio/voice")
async def twilio_voice_webhook():
    return {"status": "received"}

@router.post("/calls/initiate")
async def initiate_call(
    contact_id: UUID,
    inbox_id: UUID,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
):
    inbox = await service.get_inbox(inbox_id, current_user.tenant_id)
    if inbox.channel_type != "voice":
        raise ValueError("Inbox is not a voice channel")
        
    driver = TwilioVoiceDriver(inbox.channel_config)
    # We would fetch the contact's phone number here
    return {"status": "initiating"}

# --- Webchat API ---

from pydantic import BaseModel
class WebchatMessageRequest(BaseModel):
    session_id: str
    content: str
    name: str = "Website Visitor"

@router.post("/webchat/{tenant_id}/messages")
async def receive_webchat_message(
    tenant_id: UUID,
    data: WebchatMessageRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.messaging.models import Inbox, Conversation, Message
    from app.crm.models import Contact
    
    # 1. Find the webchat inbox for this tenant
    inbox_res = await db.execute(select(Inbox).where(Inbox.tenant_id == tenant_id, Inbox.channel_type == "web").limit(1))
    inbox = inbox_res.scalar_one_or_none()
    if not inbox:
        # Auto-create webchat inbox if it doesn't exist
        inbox = Inbox(tenant_id=tenant_id, name="Web Chat", channel_type="web", channel_config={})
        db.add(inbox)
        await db.flush()
        
    # 2. Find or create Contact based on session_id
    contact_res = await db.execute(
        select(Contact).where(Contact.tenant_id == tenant_id, Contact.custom_data.op('->>')('webchat_session') == data.session_id).limit(1)
    )
    contact = contact_res.scalar_one_or_none()
    
    if not contact:
        contact = Contact(
            tenant_id=tenant_id,
            first_name=data.name,
            source="webchat",
            custom_data={"webchat_session": data.session_id}
        )
        db.add(contact)
        await db.flush()
        
    # 3. Find open conversation or create new
    conv_res = await db.execute(
        select(Conversation).where(
            Conversation.tenant_id == tenant_id,
            Conversation.contact_id == contact.id,
            Conversation.inbox_id == inbox.id,
            Conversation.status == "open"
        ).limit(1)
    )
    conversation = conv_res.scalar_one_or_none()
    
    if not conversation:
        conversation = Conversation(
            tenant_id=tenant_id,
            contact_id=contact.id,
            inbox_id=inbox.id,
            status="open",
            channel_metadata={"webchat_session": data.session_id}
        )
        db.add(conversation)
        await db.flush()
        
    # 4. Save Message
    msg = Message(
        tenant_id=tenant_id,
        conversation_id=conversation.id,
        sender_type="contact",
        content=data.content,
        source="webchat"
    )
    db.add(msg)
    await db.commit()
    
    # 5. Broadcast to dashboard
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
    
    # 6. Trigger AI processing in background
    background_tasks.add_task(process_ai_reply, tenant_id, conversation.id, inbox.id, db)
    
    return {"status": "success"}

@router.get("/webchat/{tenant_id}/messages")
async def get_webchat_messages(
    tenant_id: UUID,
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.messaging.models import Conversation, Message
    from app.crm.models import Contact
    
    contact_res = await db.execute(
        select(Contact).where(Contact.tenant_id == tenant_id, Contact.custom_data.op('->>')('webchat_session') == session_id).limit(1)
    )
    contact = contact_res.scalar_one_or_none()
    
    if not contact:
        return []
        
    conv_res = await db.execute(
        select(Conversation).where(
            Conversation.tenant_id == tenant_id,
            Conversation.contact_id == contact.id
        ).order_by(Conversation.created_at.desc()).limit(1)
    )
    conversation = conv_res.scalar_one_or_none()
    
    if not conversation:
        return []
        
    msg_res = await db.execute(
        select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at.asc())
    )
    messages = msg_res.scalars().all()
    
    return [
        {
            "id": str(m.id),
            "content": m.content,
            "sender_type": m.sender_type,
            "created_at": str(m.created_at)
        } for m in messages
    ]
