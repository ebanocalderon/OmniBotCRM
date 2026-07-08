"""
Tenant domain — schemas (Pydantic models).

Used for API request validation and response serialization.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TenantBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    plan: Optional[str] = "free"


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    plan: Optional[str] = None
    status: Optional[str] = None
    settings: Optional[dict] = None
    feature_flags: Optional[dict] = None
    chatwoot_account_id: Optional[int] = None
    chatwoot_api_token: Optional[str] = None


class TenantResponse(TenantBase):
    id: uuid.UUID
    status: str
    settings: dict
    feature_flags: dict
    chatwoot_account_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    email: str = Field(..., max_length=255)
    name: str = Field(..., max_length=255)
    role: Optional[str] = "agent"


class UserCreate(UserBase):
    keycloak_user_id: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = None
    status: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None
    chatwoot_agent_id: Optional[int] = None


class UserResponse(UserBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    status: str
    avatar_url: Optional[str] = None
    keycloak_user_id: Optional[str] = None
    chatwoot_agent_id: Optional[int] = None
    preferences: dict
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
