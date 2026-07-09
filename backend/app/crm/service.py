"""
CRM domain — service layer.
"""
from __future__ import annotations

import uuid

from sqlalchemy import or_, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.events import DomainEvent, event_bus
from app.core.exceptions import NotFoundError
from app.crm.models import Activity, Company, Contact, Lead, Opportunity, Pipeline
from app.crm.schemas import (
    ActivityCreate,
    CompanyCreate,
    CompanyUpdate,
    ContactCreate,
    ContactFilter,
    ContactUpdate,
    LeadCreate,
    LeadUpdate,
    OpportunityCreate,
    OpportunityUpdate,
)
from app.automations.service import AutomationEngine


class CRMService:
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        self.db = db
        self.tenant_id = tenant_id

    # ── Contacts ──────────────────────────────────────────────────────────────

    async def get_contact(self, contact_id: uuid.UUID) -> Contact:
        stmt = select(Contact).where(
            Contact.id == contact_id, Contact.tenant_id == self.tenant_id
        )
        result = await self.db.execute(stmt)
        contact = result.scalars().first()
        if not contact:
            raise NotFoundError("Contact", contact_id)
        return contact

    async def create_contact(self, data: ContactCreate) -> Contact:
        contact = Contact(
            tenant_id=self.tenant_id,
            email=data.email,
            phone=data.phone,
            name=data.name,
            company=data.company,
            title=data.title,
            avatar_url=data.avatar_url,
            source=data.source,
            custom_fields=data.custom_fields or {},
            channel_identifiers=data.channel_identifiers or {},
            tags=data.tags or [],
        )
        self.db.add(contact)
        await self.db.flush()

        await event_bus.publish(
            DomainEvent(
                event_type="contact.created",
                tenant_id=self.tenant_id,
                payload={"contact_id": str(contact.id)},
            )
        )
        
        # Trigger automations
        auto_engine = AutomationEngine(self.db)
        await auto_engine.trigger_event(
            tenant_id=self.tenant_id,
            event_type="contact_created",
            context={
                "contact_id": str(contact.id),
                "source": contact.source
            }
        )
        
        return contact

    async def update_contact(
        self, contact_id: uuid.UUID, data: ContactUpdate
    ) -> Contact:
        contact = await self.get_contact(contact_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(contact, key, value)

        await self.db.flush()
        return contact

    async def filter_contacts(self, filters: ContactFilter) -> list[Contact]:
        """Advanced smart contact list filtering."""
        stmt = select(Contact).where(
            Contact.tenant_id == self.tenant_id,
        )

        if filters.is_archived is not None:
            stmt = stmt.where(Contact.is_archived == filters.is_archived)

        if filters.search:
            search_term = f"%{filters.search}%"
            stmt = stmt.where(
                or_(
                    Contact.name.ilike(search_term),
                    Contact.email.ilike(search_term),
                    Contact.phone.ilike(search_term),
                    Contact.company.ilike(search_term),
                )
            )

        if filters.tags:
            for tag in filters.tags:
                stmt = stmt.where(Contact.tags.contains([tag]))

        if filters.source:
            stmt = stmt.where(Contact.source == filters.source)

        if filters.company_id:
            stmt = stmt.where(Contact.company_id == filters.company_id)

        if filters.has_email is True:
            stmt = stmt.where(Contact.email.isnot(None), Contact.email != "")
        elif filters.has_email is False:
            stmt = stmt.where(or_(Contact.email.is_(None), Contact.email == ""))

        if filters.has_phone is True:
            stmt = stmt.where(Contact.phone.isnot(None), Contact.phone != "")
        elif filters.has_phone is False:
            stmt = stmt.where(or_(Contact.phone.is_(None), Contact.phone == ""))

        if filters.created_after:
            stmt = stmt.where(Contact.created_at >= filters.created_after)

        if filters.created_before:
            stmt = stmt.where(Contact.created_at <= filters.created_before)

        stmt = stmt.order_by(Contact.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def bulk_tag(self, contact_ids: list[uuid.UUID], tags: list[str]) -> int:
        """Add tags to multiple contacts."""
        count = 0
        for cid in contact_ids:
            try:
                contact = await self.get_contact(cid)
                existing_tags = contact.tags or []
                contact.tags = list(set(existing_tags + tags))
                count += 1
            except NotFoundError:
                continue
        await self.db.flush()
        return count

    async def bulk_archive(self, contact_ids: list[uuid.UUID]) -> int:
        """Archive multiple contacts."""
        count = 0
        for cid in contact_ids:
            try:
                contact = await self.get_contact(cid)
                contact.is_archived = True
                count += 1
            except NotFoundError:
                continue
        await self.db.flush()
        return count

    async def get_contact_timeline(self, contact_id: uuid.UUID) -> list[dict]:
        """Get unified 360° timeline for a contact (activities + conversations)."""
        await self.get_contact(contact_id)  # verify exists

        # Fetch activities
        activities_stmt = select(Activity).where(
            Activity.tenant_id == self.tenant_id,
            Activity.contact_id == contact_id,
        ).order_by(Activity.created_at.desc()).limit(50)
        activities_result = await self.db.execute(activities_stmt)
        activities = activities_result.scalars().all()

        timeline = []
        for a in activities:
            timeline.append({
                "type": "activity",
                "subtype": a.activity_type,
                "title": a.title,
                "description": a.description,
                "timestamp": a.created_at.isoformat(),
                "id": str(a.id),
            })

        # Sort combined timeline by timestamp descending
        timeline.sort(key=lambda x: x["timestamp"], reverse=True)
        return timeline

    # ── Companies ────────────────────────────────────────────────────────────────

    async def get_company(self, company_id: uuid.UUID) -> Company:
        stmt = select(Company).where(
            Company.id == company_id, Company.tenant_id == self.tenant_id
        )
        result = await self.db.execute(stmt)
        company = result.scalars().first()
        if not company:
            raise NotFoundError("Company", company_id)
        return company

    async def create_company(self, data: CompanyCreate) -> Company:
        company = Company(
            tenant_id=self.tenant_id,
            name=data.name,
            domain=data.domain,
            industry=data.industry,
            size=data.size,
            phone=data.phone,
            website=data.website,
            address=data.address,
            custom_fields=data.custom_fields or {},
            tags=data.tags or [],
        )
        self.db.add(company)
        await self.db.flush()
        return company

    async def update_company(
        self, company_id: uuid.UUID, data: CompanyUpdate
    ) -> Company:
        company = await self.get_company(company_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(company, key, value)
        await self.db.flush()
        return company

    async def delete_company(self, company_id: uuid.UUID) -> None:
        company = await self.get_company(company_id)
        await self.db.delete(company)
        await self.db.flush()

    # ── Leads ─────────────────────────────────────────────────────────────────

    async def get_lead(self, lead_id: uuid.UUID) -> Lead:
        stmt = select(Lead).where(
            Lead.id == lead_id, Lead.tenant_id == self.tenant_id
        )
        result = await self.db.execute(stmt)
        lead = result.scalars().first()
        if not lead:
            raise NotFoundError("Lead", lead_id)
        return lead

    async def create_lead(self, data: LeadCreate) -> Lead:
        # Verify contact exists
        await self.get_contact(data.contact_id)

        lead = Lead(
            tenant_id=self.tenant_id,
            contact_id=data.contact_id,
            status=data.status or "new",
            source=data.source,
            score=data.score,
            assigned_to=data.assigned_to,
            custom_fields=data.custom_fields or {},
        )
        self.db.add(lead)
        await self.db.flush()
        return lead

    async def update_lead(self, lead_id: uuid.UUID, data: LeadUpdate) -> Lead:
        lead = await self.get_lead(lead_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(lead, key, value)

        await self.db.flush()
        return lead

    # ── Opportunities ─────────────────────────────────────────────────────────

    async def create_opportunity(self, data: OpportunityCreate) -> Opportunity:
        # Verify contact and pipeline exist
        await self.get_contact(data.contact_id)
        stmt = select(Pipeline).where(
            Pipeline.id == data.pipeline_id, Pipeline.tenant_id == self.tenant_id
        )
        pipeline = (await self.db.execute(stmt)).scalars().first()
        if not pipeline:
            raise NotFoundError("Pipeline", data.pipeline_id)

        opportunity = Opportunity(
            tenant_id=self.tenant_id,
            pipeline_id=data.pipeline_id,
            contact_id=data.contact_id,
            name=data.name,
            stage=data.stage,
            amount=data.amount,
            currency=data.currency,
            close_date=data.close_date,
            probability=data.probability,
            assigned_to=data.assigned_to,
            custom_fields=data.custom_fields or {},
        )
        self.db.add(opportunity)
        await self.db.flush()
        return opportunity

    # ── Activities ────────────────────────────────────────────────────────────

    async def create_activity(self, data: ActivityCreate) -> Activity:
        await self.get_contact(data.contact_id)

        activity = Activity(
            tenant_id=self.tenant_id,
            contact_id=data.contact_id,
            user_id=data.user_id,
            activity_type=data.activity_type,
            title=data.title,
            description=data.description,
            custom_data=data.custom_data or {},
        )
        self.db.add(activity)
        await self.db.flush()
        return activity
