from uuid import UUID
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from openai import AsyncOpenAI
import logging

from app.messaging.models import Conversation, Message
from app.ai.models import AIConfig
from app.crm.models import Contact

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self, db: AsyncSession):
        self.db = db
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            api_key = "dummy_key"
        self.client = AsyncOpenAI(api_key=api_key)

    async def generate_reply(self, conversation_id: UUID, tenant_id: UUID, inbox_id: UUID) -> str | None:
        """
        Generates an AI reply for a given conversation.
        """
        # 1. Fetch AIConfig for this inbox
        stmt = select(AIConfig).where(AIConfig.inbox_id == inbox_id, AIConfig.enabled == True)
        result = await self.db.execute(stmt)
        ai_config = result.scalar_one_or_none()
        
        if not ai_config:
            logger.info(f"AI not enabled for inbox {inbox_id}")
            return None

        # 2. Fetch Conversation and Contact
        conv_stmt = select(Conversation).options(selectinload(Conversation.contact)).where(Conversation.id == conversation_id)
        conv_result = await self.db.execute(conv_stmt)
        conversation = conv_result.scalar_one_or_none()
        
        if not conversation:
            return None

        # 3. Fetch Message History
        msg_stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).limit(ai_config.max_history)
        msg_result = await self.db.execute(msg_stmt)
        messages = msg_result.scalars().all()

        # 4. Construct Prompt
        contact = conversation.contact
        contact_context = f"You are talking to {contact.first_name} {contact.last_name}." if contact else "You are talking to an unknown contact."
        
        system_prompt = ai_config.system_prompt or "You are a helpful AI assistant."
        full_system_prompt = f"{system_prompt}\n\nCRM Context: {contact_context}"

        # 5. Build OpenAI Messages Array
        openai_messages = [{"role": "system", "content": full_system_prompt}]
        for msg in messages:
            role = "assistant" if msg.sender_type in ["agent", "ai_agent"] else "user"
            openai_messages.append({"role": role, "content": msg.content or ""})

        # 6. Call OpenAI
        try:
            response = await self.client.chat.completions.create(
                model=ai_config.model if ai_config.provider == "openai" else "gpt-4o",
                messages=openai_messages,
                max_tokens=ai_config.max_tokens,
                temperature=ai_config.temperature
            )
            reply = response.choices[0].message.content
            return reply
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return None
