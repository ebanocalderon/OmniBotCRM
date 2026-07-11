import uuid
from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.tenants.dependencies import get_current_tenant_id
from app.scheduling.schemas import CalendarCreate, CalendarResponse, AppointmentCreate, AppointmentResponse
from app.scheduling.service import SchedulingService

router = APIRouter(prefix="/scheduling", tags=["scheduling"])
public_router = APIRouter(prefix="/public/scheduling", tags=["public_scheduling"])

@router.get("/calendars", response_model=List[CalendarResponse])
async def list_calendars(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    service = SchedulingService(db, tenant_id)
    return await service.get_calendars()

@router.post("/calendars", response_model=CalendarResponse)
async def create_calendar(
    data: CalendarCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    service = SchedulingService(db, tenant_id)
    return await service.create_calendar(data)

@router.get("/appointments", response_model=List[AppointmentResponse])
async def list_appointments(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from app.scheduling.models import Appointment, Calendar
    
    query = select(Appointment).join(Calendar).where(Calendar.tenant_id == tenant_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment_internal(
    data: AppointmentCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    service = SchedulingService(db, tenant_id)
    return await service.book_appointment(data)

@public_router.get("/calendars/{slug}/slots")
async def get_slots(
    slug: str,
    target_date: date,
    db: AsyncSession = Depends(get_db)
):
    service = SchedulingService(db)
    slots = await service.get_slots(slug, target_date)
    return {"slots": slots}

@public_router.post("/calendars/{slug}/book", response_model=AppointmentResponse)
async def book_appointment(
    slug: str,
    data: AppointmentCreate,
    db: AsyncSession = Depends(get_db)
):
    # In a full implementation, this should look up the calendar by slug
    service = SchedulingService(db)
    return await service.book_appointment(data)
