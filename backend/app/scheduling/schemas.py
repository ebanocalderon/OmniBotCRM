import uuid
from datetime import datetime, time
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class AvailabilityBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time
    end_time: time
    is_available: bool = True

class AvailabilityResponse(AvailabilityBase):
    id: uuid.UUID
    calendar_id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)

class CalendarBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=255)
    description: Optional[str] = None
    calendar_type: str = "personal"
    timezone: str = "UTC"
    duration_minutes: int = 30
    buffer_before_minutes: int = 0
    buffer_after_minutes: int = 0
    owner_user_id: Optional[uuid.UUID] = None
    team_user_ids: Optional[list] = Field(default_factory=list)

class CalendarCreate(CalendarBase):
    pass

class CalendarResponse(CalendarBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    
    model_config = ConfigDict(from_attributes=True)

class AppointmentBase(BaseModel):
    calendar_id: uuid.UUID
    contact_id: uuid.UUID
    assigned_user_id: Optional[uuid.UUID] = None
    start_time: datetime
    end_time: datetime
    status: str = "confirmed"
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
