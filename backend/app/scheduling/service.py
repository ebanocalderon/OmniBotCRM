import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.scheduling.models import Calendar, Availability, Appointment
from app.scheduling.schemas import CalendarCreate, AppointmentCreate

class SchedulingService:
    def __init__(self, db: AsyncSession, tenant_id: Optional[uuid.UUID] = None):
        self.db = db
        self.tenant_id = tenant_id

    async def get_calendars(self) -> List[Calendar]:
        query = select(Calendar)
        if self.tenant_id:
            query = query.where(Calendar.tenant_id == self.tenant_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_calendar(self, data: CalendarCreate) -> Calendar:
        if not self.tenant_id:
            raise ValueError("Tenant ID required")
            
        calendar = Calendar(
            **data.model_dump(),
            tenant_id=self.tenant_id
        )
        self.db.add(calendar)
        
        # Add default availability (Mon-Fri 9am-5pm)
        import datetime as dt
        for i in range(5):
            avail = Availability(
                calendar=calendar,
                day_of_week=i,
                start_time=dt.time(9, 0),
                end_time=dt.time(17, 0)
            )
            self.db.add(avail)
            
        await self.db.commit()
        await self.db.refresh(calendar)
        return calendar

    async def book_appointment(self, data: AppointmentCreate) -> Appointment:
        appointment = Appointment(**data.model_dump())
        self.db.add(appointment)
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment
        
    async def get_slots(self, calendar_slug: str, target_date: datetime.date) -> List[str]:
        # Minimal mock implementation for finding slots
        # In a full implementation this would factor in the Availability table and existing Appointments
        return ["09:00", "09:30", "10:00", "13:00", "14:00"]
