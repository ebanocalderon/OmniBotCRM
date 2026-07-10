import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, Integer, Time
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Calendar(Base):
    __tablename__ = "calendars"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    calendar_type: Mapped[str] = mapped_column(String(50), default="personal") # personal, round_robin, class
    timezone: Mapped[str] = mapped_column(String(100), default="UTC")
    
    owner_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    team_user_ids: Mapped[Optional[dict]] = mapped_column(JSONB, default=list) # For round robin
    
    # Settings
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    buffer_before_minutes: Mapped[int] = mapped_column(Integer, default=0)
    buffer_after_minutes: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    availabilities: Mapped[list["Availability"]] = relationship("Availability", back_populates="calendar", cascade="all, delete-orphan")
    appointments: Mapped[list["Appointment"]] = relationship("Appointment", back_populates="calendar", cascade="all, delete-orphan")


class Availability(Base):
    __tablename__ = "availabilities"

    calendar_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("calendars.id", ondelete="CASCADE"), nullable=False, index=True)
    
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False) # 0 = Monday, 6 = Sunday
    start_time: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    end_time: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    calendar: Mapped["Calendar"] = relationship("Calendar", back_populates="availabilities")


class Appointment(Base):
    __tablename__ = "appointments"

    calendar_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("calendars.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    status: Mapped[str] = mapped_column(String(50), default="confirmed") # confirmed, cancelled, no_show, completed
    meeting_url: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    calendar: Mapped["Calendar"] = relationship("Calendar", back_populates="appointments")
