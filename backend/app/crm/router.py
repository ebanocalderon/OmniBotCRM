"""
CRM domain — FastAPI router.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query

from app.core.pagination import PaginatedResponse, paginate_query
from app.crm.models import Activity, Company, Contact, Lead, Opportunity
from app.crm.schemas import (
    ActivityCreate,
    ActivityResponse,
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
    ContactCreate,
    ContactFilter,
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
from pydantic import BaseModel

router = APIRouter(prefix="/crm", tags=["crm"])

# ── Companies ──────────────────────────────────────────────────────────────────


@router.get("/companies", response_model=PaginatedResponse[CompanyResponse])
async def list_companies(
    db: DbSession,
    tenant_ctx: CurrentTenant,
    pagination: Pagination,
) -> dict:
    """List all companies."""
    query = select(Company).where(Company.tenant_id == tenant_ctx.tenant_id)
    return await paginate_query(db, query, pagination)


@router.post("/companies", response_model=CompanyResponse)
async def create_company(
    data: CompanyCreate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> CompanyResponse:
    """Create a new company."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.create_company(data)


@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: uuid.UUID,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> CompanyResponse:
    """Get a specific company."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.get_company(company_id)


@router.patch("/companies/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: uuid.UUID,
    data: CompanyUpdate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> CompanyResponse:
    """Update a company."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.update_company(company_id, data)


@router.delete("/companies/{company_id}")
async def delete_company(
    company_id: uuid.UUID,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> dict:
    """Delete a company."""
    service = CRMService(db, tenant_ctx.tenant_id)
    await service.delete_company(company_id)
    return {"ok": True}


@router.get("/companies/{company_id}/contacts", response_model=list[ContactResponse])
async def list_company_contacts(
    company_id: uuid.UUID,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> list[ContactResponse]:
    """List all contacts under a company."""
    service = CRMService(db, tenant_ctx.tenant_id)
    await service.get_company(company_id)  # verify exists
    filters = ContactFilter(company_id=company_id, is_archived=False)
    return await service.filter_contacts(filters)


# ── Contacts ───────────────────────────────────────────────────────────────────


@router.get("/contacts", response_model=PaginatedResponse[ContactResponse])
async def list_contacts(
    db: DbSession,
    tenant_ctx: CurrentTenant,
    pagination: Pagination,
    search: Optional[str] = Query(None, description="Search name, email, phone, company"),
    source: Optional[str] = Query(None),
    is_archived: Optional[bool] = Query(False),
    company_id: Optional[uuid.UUID] = Query(None),
) -> dict:
    """List contacts with optional filtering."""
    query = select(Contact).where(
        Contact.tenant_id == tenant_ctx.tenant_id,
    )
    if is_archived is not None:
        query = query.where(Contact.is_archived == is_archived)
    if search:
        from sqlalchemy import or_
        term = f"%{search}%"
        query = query.where(or_(
            Contact.name.ilike(term),
            Contact.email.ilike(term),
            Contact.phone.ilike(term),
            Contact.company.ilike(term),
        ))
    if source:
        query = query.where(Contact.source == source)
    if company_id:
        query = query.where(Contact.company_id == company_id)

    return await paginate_query(db, query, pagination)


@router.post("/contacts/filter", response_model=list[ContactResponse])
async def filter_contacts(
    filters: ContactFilter,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> list[ContactResponse]:
    """Advanced smart contact list filtering."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.filter_contacts(filters)


class BulkTagRequest(BaseModel):
    contact_ids: list[uuid.UUID]
    tags: list[str]


@router.post("/contacts/bulk/tag")
async def bulk_tag_contacts(
    data: BulkTagRequest,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> dict:
    """Add tags to multiple contacts at once."""
    service = CRMService(db, tenant_ctx.tenant_id)
    count = await service.bulk_tag(data.contact_ids, data.tags)
    return {"tagged": count}


class BulkArchiveRequest(BaseModel):
    contact_ids: list[uuid.UUID]


@router.post("/contacts/bulk/archive")
async def bulk_archive_contacts(
    data: BulkArchiveRequest,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> dict:
    """Archive multiple contacts at once."""
    service = CRMService(db, tenant_ctx.tenant_id)
    count = await service.bulk_archive(data.contact_ids)
    return {"archived": count}


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


@router.get("/contacts/{contact_id}/timeline")
async def get_contact_timeline(
    contact_id: uuid.UUID,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> list[dict]:
    """Get unified 360° timeline for a contact."""
    service = CRMService(db, tenant_ctx.tenant_id)
    return await service.get_contact_timeline(contact_id)


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
