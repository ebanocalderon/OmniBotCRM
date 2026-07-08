"""
AI domain — SQLAlchemy models.

AIConfig: per-inbox AI agent configuration (provider, model, prompt, guardrails).
ConversationMemory: persistent conversation history for AI context (replaces in-memory dict).
"""
from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AIConfig(Base):
    """
    Per-inbox AI agent configuration.

    Each inbox can have its own AI settings: provider, model,
    system prompt, guardrails, and conversation memory limits.
    This replaces the old inbox_configurations table from SQLite.
    """

    __tablename__ = "ai_configs"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    inbox_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("inboxes.id"),
        nullable=False,
        unique=True,
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    provider: Mapped[str] = mapped_column(
        String(50), default="ollama"
    )  # ollama | openai | anthropic | gemini | openrouter
    model: Mapped[str] = mapped_column(String(100), default="llama3")

    # System prompt — defines the AI agent's personality and instructions
    system_prompt: Mapped[Optional[str]] = mapped_column(Text)

    # Provider-specific configuration (API keys, base URLs, parameters)
    # API keys stored here are encrypted at the application layer
    provider_config: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Model parameters
    temperature: Mapped[Optional[float]] = mapped_column(default=0.7)
    max_tokens: Mapped[Optional[int]] = mapped_column(Integer, default=2048)

    # Memory settings
    max_history: Mapped[int] = mapped_column(Integer, default=20)

    # Guardrails configuration
    guardrails: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Human handoff keywords (if user says these, route to human agent)
    handoff_keywords: Mapped[Optional[list]] = mapped_column(JSONB, default=list)

    # Relationships
    inbox: Mapped["Inbox"] = relationship(back_populates="ai_config")

    __table_args__ = (
        {"comment": "Per-inbox AI agent configuration — tenant-scoped"},
    )

    def __repr__(self) -> str:
        return f"<AIConfig id={self.id} provider={self.provider} model={self.model}>"


class ConversationMemory(Base):
    """
    Persistent AI conversation memory.

    Replaces the in-memory dict from the bridge prototype.
    Stores the full message history used as context for AI responses.
    Pruned by a background worker based on max_history settings.
    """

    __tablename__ = "ai_conversation_memory"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # system | user | assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[Optional[int]] = mapped_column(Integer)

    __table_args__ = (
        {"comment": "AI conversation memory — ordered by created_at for context window"},
    )

    def __repr__(self) -> str:
        return f"<ConversationMemory id={self.id} role={self.role}>"
