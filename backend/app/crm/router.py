"""
CRM domain — FastAPI router.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.core.pagination import PaginatedResponse, paginate_query
from app.crm.models import Activity, Contact, Lead, Opportunity
from app.crm.schemas import (
    ActivityCreate,
    ActivityResponse,
    ContactCreate,
    ContactResponse,
    ContactUpdate,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
    OpportunityCreate,
    OpportunityResponse,
    OpportunityUpdate,
)
from app.crm.service import CRMService
from app.dependencies import CurrentTenant, DbSession, Pagination
from sqlalchemy import select

router = APIRouter(prefix="/crm", tags=["crm"])

# ── Contacts ───────────────────────────────────────────────────────────────────


@router.get("/contacts", response_model=PaginatedResponse[ContactResponse])
async def list_contacts(
    db: DbSession,
    tenant_ctx: CurrentTenant,
    pagination: Pagination,
) -> dict:
    """List all contacts with cursor pagination."""
    query = select(Contact).where(Contact.tenant_id == tenant_ctx.tenant_id)
    return await paginate_query(db, query, pagination)


@router.post("/contacts", response_model=ContactResponse)
async def create_contact(
    data: ContactCreate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> ContactResponse:
    """Create a new contact."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.create_contact(data)


@router.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: uuid.UUID,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> ContactResponse:
    """Get a specific contact by ID."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.get_contact(contact_id)


@router.patch("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: uuid.UUID,
    data: ContactUpdate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> ContactResponse:
    """Update a contact."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.update_contact(contact_id, data)


# ── Leads ──────────────────────────────────────────────────────────────────────


@router.get("/leads", response_model=PaginatedResponse[LeadResponse])
async def list_leads(
    db: DbSession,
    tenant_ctx: CurrentTenant,
    pagination: Pagination,
) -> dict:
    """List all sales leads."""
    query = select(Lead).where(Lead.tenant_id == tenant_ctx.tenant_id)
    return await paginate_query(db, query, pagination)


@router.post("/leads", response_model=LeadResponse)
async def create_lead(
    data: LeadCreate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> LeadResponse:
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.create_lead(data)


# ── Opportunities ─────────────────────────────────────────────────────────────


@router.get("/opportunities", response_model=PaginatedResponse[OpportunityResponse])
async def list_opportunities(
    db: DbSession,
    tenant_ctx: CurrentTenant,
    pagination: Pagination,
) -> dict:
    query = select(Opportunity).where(Opportunity.tenant_id == tenant_ctx.tenant_id)
    return await paginate_query(db, query, pagination)


@router.post("/opportunities", response_model=OpportunityResponse)
async def create_opportunity(
    data: OpportunityCreate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> OpportunityResponse:
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.create_opportunity(data)


# ── Activities ────────────────────────────────────────────────────────────────


@router.get("/contacts/{contact_id}/activities", response_model=PaginatedResponse[ActivityResponse])
async def list_contact_activities(
    contact_id: uuid.UUID,
    db: DbSession,
    tenant_ctx: CurrentTenant,
    pagination: Pagination,
) -> dict:
    """List activity timeline for a specific contact."""
    query = select(Activity).where(
        Activity.tenant_id == tenant_ctx.tenant_id,
        Activity.contact_id == contact_id,
    ).order_by(Activity.created_at.desc())
    return await paginate_query(db, query, pagination, id_column=Activity.created_at)


@router.post("/activities", response_model=ActivityResponse)
async def create_activity(
    data: ActivityCreate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> ActivityResponse:
    """Manually add an activity (note, call log) to a contact."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.create_activity(data)
