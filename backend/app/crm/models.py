"""
CRM domain — SQLAlchemy models.

Core CRM entities: Contact, Lead, Opportunity, Pipeline, Activity.
All models are tenant-scoped via tenant_id.
"""
from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Contact(Base):
    """
    A customer/prospect that interacts with the platform.

    Contacts are created automatically when a new conversation arrives
    via Chatwoot, or manually by agents in the CRM.
    """

    __tablename__ = "contacts"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    email: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    name: Mapped[Optional[str]] = mapped_column(String(255))
    company: Mapped[Optional[str]] = mapped_column(String(255))
    title: Mapped[Optional[str]] = mapped_column(String(255))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    source: Mapped[Optional[str]] = mapped_column(
        String(50)
    )  # web, telegram, whatsapp, api, import

    # Flexible custom fields per tenant
    custom_fields: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Channel identifiers (telegram_chat_id, whatsapp_number, etc.)
    channel_identifiers: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Chatwoot shadow ID
    chatwoot_contact_id: Mapped[Optional[int]] = mapped_column(Integer)

    # Tags for segmentation
    tags: Mapped[Optional[list]] = mapped_column(JSONB, default=list)

    # Relationships
    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation", back_populates="contact", lazy="selectin"
    )
    activities: Mapped[list["Activity"]] = relationship(
        back_populates="contact", lazy="selectin"
    )
    leads: Mapped[list["Lead"]] = relationship(back_populates="contact", lazy="selectin")

    __table_args__ = (
        {"comment": "Customer/prospect contacts — tenant-scoped"},
    )

    def __repr__(self) -> str:
        return f"<Contact id={self.id} name={self.name} tenant={self.tenant_id}>"


class Lead(Base):
    """
    A sales lead derived from a Contact.

    Leads track the qualification and scoring process
    before being converted into an Opportunity.
    """

    __tablename__ = "leads"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default="new"
    )  # new | qualified | unqualified | converted | lost
    source: Mapped[Optional[str]] = mapped_column(String(100))
    score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    custom_fields: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Relationships
    contact: Mapped["Contact"] = relationship(back_populates="leads")

    __table_args__ = (
        {"comment": "Sales leads — tenant-scoped"},
    )

    def __repr__(self) -> str:
        return f"<Lead id={self.id} status={self.status}>"


class Pipeline(Base):
    """
    A sales pipeline with ordered stages.

    Each tenant can define multiple pipelines (e.g. "New Business", "Renewal").
    Stages are stored as an ordered JSON array for flexibility.
    """

    __tablename__ = "pipelines"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    stages: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=lambda: [
            {"name": "Prospecting", "probability": 10},
            {"name": "Qualification", "probability": 25},
            {"name": "Proposal", "probability": 50},
            {"name": "Negotiation", "probability": 75},
            {"name": "Closed Won", "probability": 100},
            {"name": "Closed Lost", "probability": 0},
        ],
    )
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    opportunities: Mapped[list["Opportunity"]] = relationship(
        back_populates="pipeline", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Pipeline id={self.id} name={self.name}>"


class Opportunity(Base):
    """
    A sales opportunity tied to a Contact and Pipeline.

    Represents a potential deal with an expected value and close date.
    """

    __tablename__ = "opportunities"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    pipeline_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pipelines.id"), nullable=False
    )
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    stage: Mapped[str] = mapped_column(String(100), default="Prospecting")
    amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    close_date: Mapped[Optional[date]] = mapped_column(Date)
    probability: Mapped[Optional[int]] = mapped_column(Integer)
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    custom_fields: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Relationships
    pipeline: Mapped["Pipeline"] = relationship(back_populates="opportunities")
    contact: Mapped["Contact"] = relationship()

    def __repr__(self) -> str:
        return f"<Opportunity id={self.id} name={self.name} stage={self.stage}>"


class Activity(Base):
    """
    A timeline event for a Contact.

    Activities include: calls, emails, notes, meetings, status changes,
    AI interactions — anything worth recording in the contact's history.
    """

    __tablename__ = "activities"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    activity_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # note | call | email | meeting | status_change | ai_interaction
    title: Mapped[Optional[str]] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    custom_data: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Relationships
    contact: Mapped["Contact"] = relationship(back_populates="activities")

    __table_args__ = (
        {"comment": "Contact activity timeline — tenant-scoped"},
    )

    def __repr__(self) -> str:
        return f"<Activity id={self.id} type={self.activity_type}>"
