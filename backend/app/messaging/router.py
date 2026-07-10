from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.tenants.models import User
from app.messaging.schemas import (
    InboxCreate, InboxUpdate, InboxResponse,
    ConversationCreate, ConversationUpdate, ConversationResponse,
    MessageCreate, MessageResponse
)
from app.messaging.service import MessagingService
from app.messaging.webhooks.whatsapp import router as whatsapp_router
from app.messaging.channels.sms_twilio import TwilioSMSDriver
from app.messaging.channels.voice_twilio import TwilioVoiceDriver
from app.messaging.channels.email_smtp import SMTPEmailDriver

router = APIRouter(prefix="/messaging", tags=["messaging"])
router.include_router(whatsapp_router, prefix="/webhooks")

def get_messaging_service(db: AsyncSession = Depends(get_db)) -> MessagingService:
    return MessagingService(db)

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
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service)
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

    # 2. Save to DB
    data.conversation_id = conversation_id
    return await service.create_message(current_user.tenant_id, data)

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
    # result = await driver.initiate_outbound_call(contact.phone, str(current_user.id))
    return {"status": "initiating"}
