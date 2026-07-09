"""
CRM domain — service layer.
"""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.events import DomainEvent, event_bus
from app.core.exceptions import NotFoundError
from app.crm.models import Activity, Contact, Lead, Opportunity, Pipeline
from app.crm.schemas import (
    ActivityCreate,
    ContactCreate,
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
