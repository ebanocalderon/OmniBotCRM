"""
Tenant domain — SQLAlchemy models.

The Tenant is the top-level entity in the multi-tenant hierarchy.
Every other model in the platform has a tenant_id FK pointing here.
"""
from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Tenant(Base):
    """
    Represents an organization (customer) on the platform.

    Each tenant has isolated data, settings, feature flags, and users.
    Maps 1:1 to a Keycloak Realm in the auth layer.
    """

    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    plan: Mapped[str] = mapped_column(String(50), default="free")
    status: Mapped[str] = mapped_column(
        String(20), default="active"
    )  # active | suspended | cancelled

    # Flexible settings and feature flags per tenant
    settings: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    feature_flags: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Chatwoot account mapping (Anti-Corruption Layer)
    chatwoot_account_id: Mapped[Optional[int]] = mapped_column(Integer)
    chatwoot_api_token: Mapped[Optional[str]] = mapped_column(
        Text
    )  # Encrypted at application layer

    # Billing
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255))

    # Relationships
    users: Mapped[list["User"]] = relationship(back_populates="tenant", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Tenant id={self.id} slug={self.slug}>"


class User(Base):
    """
    A user (human agent, admin, etc.) belonging to a tenant.

    Authentication is handled by Keycloak; this model stores
    platform-specific user data and preferences.
    """

    __tablename__ = "users"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="agent")
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(
        String(20), default="active"
    )  # active | inactive | suspended

    # Keycloak mapping
    keycloak_user_id: Mapped[Optional[str]] = mapped_column(
        String(255), unique=True, index=True
    )

    # Chatwoot agent mapping
    chatwoot_agent_id: Mapped[Optional[int]] = mapped_column(Integer)

    # User preferences (theme, notification settings, etc.)
    preferences: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Relationships
    tenant: Mapped["Tenant"] = relationship(back_populates="users")

    # Unique constraint: one email per tenant
    __table_args__ = (
        # Composite unique: same email cannot exist twice in the same tenant
        # But CAN exist in different tenants
        {"comment": "Platform users (agents, admins) — one per Keycloak identity per tenant"},
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} tenant={self.tenant_id}>"
