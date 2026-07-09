from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.messaging.models import Inbox, Conversation, Message
from app.messaging.schemas import (
    InboxCreate, InboxUpdate, 
    ConversationCreate, ConversationUpdate,
    MessageCreate
)

class MessagingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # INBOXES
    async def get_inbox(self, inbox_id: UUID, tenant_id: UUID) -> Inbox:
        stmt = select(Inbox).where(and_(Inbox.id == inbox_id, Inbox.tenant_id == tenant_id))
        result = await self.db.execute(stmt)
        inbox = result.scalar_one_or_none()
        if not inbox:
            raise NotFoundError(resource_type="Inbox")
        return inbox

    async def list_inboxes(self, tenant_id: UUID) -> List[Inbox]:
        stmt = select(Inbox).where(Inbox.tenant_id == tenant_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_inbox(self, tenant_id: UUID, data: InboxCreate) -> Inbox:
        inbox = Inbox(tenant_id=tenant_id, **data.model_dump())
        self.db.add(inbox)
        await self.db.commit()
        await self.db.refresh(inbox)
        return inbox

    async def update_inbox(self, inbox_id: UUID, tenant_id: UUID, data: InboxUpdate) -> Inbox:
        inbox = await self.get_inbox(inbox_id, tenant_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(inbox, key, value)
        await self.db.commit()
        await self.db.refresh(inbox)
        return inbox

    # CONVERSATIONS
    async def get_conversation(self, conversation_id: UUID, tenant_id: UUID) -> Conversation:
        stmt = select(Conversation).options(selectinload(Conversation.contact)).where(
            and_(Conversation.id == conversation_id, Conversation.tenant_id == tenant_id)
        )
        result = await self.db.execute(stmt)
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise NotFoundError(resource_type="Conversation")
        return conversation

    async def list_conversations(self, tenant_id: UUID, limit: int = 50, offset: int = 0) -> List[Conversation]:
        stmt = select(Conversation).options(selectinload(Conversation.contact)).where(
            Conversation.tenant_id == tenant_id
        ).order_by(Conversation.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_conversation(self, tenant_id: UUID, data: ConversationCreate) -> Conversation:
        conv = Conversation(tenant_id=tenant_id, **data.model_dump())
        self.db.add(conv)
        await self.db.commit()
        await self.db.refresh(conv)
        return conv

    async def update_conversation(self, conversation_id: UUID, tenant_id: UUID, data: ConversationUpdate) -> Conversation:
        conv = await self.get_conversation(conversation_id, tenant_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(conv, key, value)
        await self.db.commit()
        await self.db.refresh(conv)
        return conv

    # MESSAGES
    async def list_messages(self, conversation_id: UUID, tenant_id: UUID, limit: int = 100) -> List[Message]:
        # Verify conversation belongs to tenant
        await self.get_conversation(conversation_id, tenant_id)
        
        stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_message(self, tenant_id: UUID, data: MessageCreate) -> Message:
        # Verify conversation exists
        await self.get_conversation(data.conversation_id, tenant_id)
        
        msg = Message(tenant_id=tenant_id, **data.model_dump())
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg
