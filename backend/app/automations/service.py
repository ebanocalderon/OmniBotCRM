import logging
from uuid import UUID
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.automations.models import AutomationRule
from app.crm.models import Contact
from app.messaging.models import Conversation, Message

logger = logging.getLogger(__name__)

class AutomationEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def trigger_event(self, tenant_id: UUID, event_type: str, context: dict[str, Any]):
        """
        Evaluate and execute active rules for a specific event.
        """
        stmt = select(AutomationRule).where(
            AutomationRule.tenant_id == tenant_id,
            AutomationRule.trigger_event == event_type,
            AutomationRule.is_active == True
        )
        result = await self.db.execute(stmt)
        rules = result.scalars().all()

        for rule in rules:
            if self._evaluate_condition(rule.trigger_condition, context):
                await self._execute_action(rule, context)

    def _evaluate_condition(self, condition: dict[str, Any], context: dict[str, Any]) -> bool:
        """
        Check if the context satisfies the trigger condition.
        Empty condition matches everything.
        """
        if not condition:
            return True
            
        for key, expected_value in condition.items():
            if context.get(key) != expected_value:
                return False
        return True

    async def _execute_action(self, rule: AutomationRule, context: dict[str, Any]):
        """
        Execute the configured action.
        """
        try:
            if rule.action_type == "send_message":
                await self._action_send_message(rule.action_config, context)
            elif rule.action_type == "add_tag":
                # For future: implement add tag logic
                logger.info(f"Adding tag for rule {rule.name}")
            else:
                logger.warning(f"Unknown action type: {rule.action_type}")
        except Exception as e:
            logger.error(f"Error executing automation rule {rule.id}: {e}")

    async def _action_send_message(self, config: dict[str, Any], context: dict[str, Any]):
        """
        Action to send a message. Requires conversation_id or contact_id & inbox_id in context.
        """
        message_text = config.get("message")
        if not message_text:
            return

        conversation_id = context.get("conversation_id")
        
        # If no conversation context is passed, we can't send a message (needs an inbox)
        # For a full implementation, we'd find the default inbox for the contact.
        if not conversation_id:
            logger.warning("No conversation_id in context, cannot send message via automation.")
            return
            
        # 1. Fetch conversation
        conv_stmt = select(Conversation).where(Conversation.id == conversation_id)
        conv_result = await self.db.execute(conv_stmt)
        conversation = conv_result.scalar_one_or_none()
        
        if not conversation:
            return
            
        # 2. Save Message to DB (simulate sending)
        msg = Message(
            tenant_id=conversation.tenant_id,
            conversation_id=conversation.id,
            sender_type="automation",
            content=message_text,
            source="platform"
        )
        self.db.add(msg)
        await self.db.commit()
        logger.info(f"Automation executed: Sent message '{message_text}' to conversation {conversation_id}")
        
        # Note: In a full implementation, we would call the WhatsApp/Telegram client here
        # to physically send the message to the end user.
