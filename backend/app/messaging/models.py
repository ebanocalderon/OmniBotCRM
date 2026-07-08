"""
Messaging domain — SQLAlchemy models.

Core messaging entities: Inbox, Conversation, Message.
These mirror Chatwoot's concepts but live in OUR database.
Chatwoot IDs are stored as shadow columns for API interop only.
"""
from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Inbox(Base):
    """
    A communication channel (Telegram, WhatsApp, Web Chat, Email, etc.).

    Each inbox maps to a Chatwoot inbox under the hood.
    The platform abstracts this — customers never see "Chatwoot".
    """

    __tablename__ = "inboxes"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    channel_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # telegram | whatsapp | web | email | sms | facebook | twitter | api
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Channel-specific configuration (bot tokens, phone numbers, etc.)
    # Sensitive values are encrypted at the application layer
    channel_config: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Chatwoot shadow ID
    chatwoot_inbox_id: Mapped[Optional[int]] = mapped_column(Integer)

    # Relationships
    conversations: Mapped[list["Conversation"]] = relationship(
        back_populates="inbox", lazy="selectin"
    )
    ai_config: Mapped[Optional["AIConfig"]] = relationship(
        back_populates="inbox", lazy="selectin", uselist=False
    )

    def __repr__(self) -> str:
        return f"<Inbox id={self.id} name={self.name} type={self.channel_type}>"


class Conversation(Base):
    """
    A conversation thread between a Contact and the platform.

    Conversations are created when Chatwoot receives a new message
    on any channel. Our platform tracks them independently.
    """

    __tablename__ = "conversations"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False
    )
    inbox_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("inboxes.id"), nullable=False
    )
    assigned_agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="open", index=True
    )  # open | pending | resolved | snoozed
    priority: Mapped[Optional[str]] = mapped_column(
        String(20)
    )  # urgent | high | medium | low | none

    # Chatwoot shadow ID
    chatwoot_conversation_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)

    # Additional metadata (labels, custom attributes from Chatwoot)
    custom_data: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Relationships
    contact: Mapped["Contact"] = relationship(back_populates="conversations")
    inbox: Mapped["Inbox"] = relationship(back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(
        back_populates="conversation", lazy="selectin", order_by="Message.created_at"
    )

    __table_args__ = (
        {"comment": "Conversation threads — tenant-scoped"},
    )

    def __repr__(self) -> str:
        return f"<Conversation id={self.id} status={self.status}>"


class Message(Base):
    """
    A single message within a Conversation.

    Messages can come from contacts (incoming), agents (outgoing),
    or AI agents (outgoing, automated).
    """

    __tablename__ = "messages"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False, index=True
    )
    sender_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True)
    )  # User ID (agent) or Contact ID
    sender_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # contact | agent | ai_agent | system
    content: Mapped[Optional[str]] = mapped_column(Text)
    content_type: Mapped[str] = mapped_column(
        String(30), default="text"
    )  # text | image | file | audio | video | template
    source: Mapped[str] = mapped_column(
        String(30), default="platform"
    )  # platform | chatwoot | telegram | whatsapp | api

    # Chatwoot shadow ID
    chatwoot_message_id: Mapped[Optional[int]] = mapped_column(Integer)

    # Attachments and rich content metadata
    custom_data: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Private flag (internal notes, not visible to contact)
    private: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    conversation: Mapped["Conversation"] = relationship(back_populates="messages")

    __table_args__ = (
        {"comment": "Individual messages within conversations — tenant-scoped"},
    )

    def __repr__(self) -> str:
        return f"<Message id={self.id} type={self.sender_type}>"


# Import here to avoid circular imports — AIConfig references Inbox
from app.ai.models import AIConfig  # noqa: E402, F401
