import uuid
from datetime import datetime, UTC
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    
    # Trigger configuration
    trigger_event = Column(String(50), nullable=False) # e.g., 'contact_created', 'message_received'
    trigger_condition = Column(JSON, default={})
    
    # Action configuration
    action_type = Column(String(50), nullable=False) # e.g., 'send_message', 'add_tag'
    action_config = Column(JSON, default={})
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    tenant = relationship("Tenant", backref="automation_rules")
