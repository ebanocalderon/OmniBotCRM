"""
CRM domain — schemas (Pydantic models).
"""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Company ─────────────────────────────────────────────────────────────────────


class CompanyBase(BaseModel):
    name: str = Field(..., max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    size: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=500)
    address: Optional[str] = None
    custom_fields: Optional[dict] = None
    tags: Optional[list[str]] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    size: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=500)
    address: Optional[str] = None
    custom_fields: Optional[dict] = None
    tags: Optional[list[str]] = None


class CompanyResponse(CompanyBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Contact ───────────────────────────────────────────────────────────────────


class ContactBase(BaseModel):
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    company_id: Optional[uuid.UUID] = None
    title: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = Field(None, max_length=500)
    source: Optional[str] = Field(None, max_length=50)
    custom_fields: Optional[dict] = None
    channel_identifiers: Optional[dict] = None
    tags: Optional[list[str]] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(ContactBase):
    pass


class ContactResponse(ContactBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    chatwoot_contact_id: Optional[int] = None
    is_archived: bool = False
    last_activity_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactFilter(BaseModel):
    """Advanced filter parameters for smart contact lists."""
    search: Optional[str] = None
    tags: Optional[list[str]] = None
    source: Optional[str] = None
    company_id: Optional[uuid.UUID] = None
    is_archived: Optional[bool] = False
    has_email: Optional[bool] = None
    has_phone: Optional[bool] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None


# ── Lead ──────────────────────────────────────────────────────────────────────


class LeadBase(BaseModel):
    contact_id: uuid.UUID
    status: Optional[str] = "new"
    source: Optional[str] = None
    score: Optional[float] = None
    assigned_to: Optional[uuid.UUID] = None
    custom_fields: Optional[dict] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    score: Optional[float] = None
    assigned_to: Optional[uuid.UUID] = None
    custom_fields: Optional[dict] = None


class LeadResponse(LeadBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Pipeline & Opportunity ────────────────────────────────────────────────────


class PipelineBase(BaseModel):
    name: str = Field(..., max_length=255)
    stages: list[dict]
    is_default: bool = False


class PipelineResponse(PipelineBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OpportunityBase(BaseModel):
    pipeline_id: uuid.UUID
    contact_id: uuid.UUID
    name: str = Field(..., max_length=255)
    stage: str = Field(..., max_length=100)
    amount: Optional[Decimal] = None
    currency: str = "USD"
    close_date: Optional[date] = None
    probability: Optional[int] = None
    assigned_to: Optional[uuid.UUID] = None
    custom_fields: Optional[dict] = None


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    name: Optional[str] = None
    stage: Optional[str] = None
    amount: Optional[Decimal] = None
    close_date: Optional[date] = None
    probability: Optional[int] = None
    assigned_to: Optional[uuid.UUID] = None
    custom_fields: Optional[dict] = None


class OpportunityResponse(OpportunityBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Activity ──────────────────────────────────────────────────────────────────


class ActivityBase(BaseModel):
    contact_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    activity_type: str = Field(..., max_length=50)
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    custom_data: Optional[dict] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityResponse(ActivityBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
