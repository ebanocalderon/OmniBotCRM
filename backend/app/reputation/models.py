import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, Float
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReviewRequest(Base):
    __tablename__ = "review_requests"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False, index=True)
    
    platform: Mapped[str] = mapped_column(String(50), nullable=False) # google, facebook, yelp
    status: Mapped[str] = mapped_column(String(20), default="pending") # pending, sent, completed
    review_url: Mapped[Optional[str]] = mapped_column(Text)
    
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Optional relationship mapping if we want to trace the resulting Review
    review_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("reviews.id", ondelete="SET NULL"))


class Review(Base):
    __tablename__ = "reviews"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    external_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text)
    author_name: Mapped[str] = mapped_column(String(255))
    author_avatar_url: Mapped[Optional[str]] = mapped_column(Text)
    
    reply_content: Mapped[Optional[str]] = mapped_column(Text)
    replied_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
