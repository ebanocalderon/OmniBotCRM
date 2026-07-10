import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    trigger_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. contact_created, tag_added
    trigger_config: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    
    # Relationships
    steps: Mapped[list["WorkflowStep"]] = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")
    executions: Mapped[list["WorkflowExecution"]] = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    workflow_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    
    step_type: Mapped[str] = mapped_column(String(50), nullable=False) # action, condition, delay, goto
    action_type: Mapped[Optional[str]] = mapped_column(String(100)) # send_email, add_tag, if_else
    
    position: Mapped[dict] = mapped_column(JSONB, default=dict) # x, y coordinates for ReactFlow
    config: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    
    next_step_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    else_step_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True)) # for if_else branches
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="steps")


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    workflow_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False, index=True)
    
    status: Mapped[str] = mapped_column(String(20), default="running") # running, completed, failed, paused
    current_step_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workflow_steps.id", ondelete="SET NULL"))
    
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Execution Memory
    context_data: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="executions")
    logs: Mapped[list["WorkflowExecutionLog"]] = relationship("WorkflowExecutionLog", back_populates="execution", cascade="all, delete-orphan")


class WorkflowExecutionLog(Base):
    __tablename__ = "workflow_execution_logs"

    execution_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workflow_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    step_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("workflow_steps.id", ondelete="SET NULL"))
    
    status: Mapped[str] = mapped_column(String(20)) # success, error
    input_data: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    output_data: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    execution: Mapped["WorkflowExecution"] = relationship("WorkflowExecution", back_populates="logs")
