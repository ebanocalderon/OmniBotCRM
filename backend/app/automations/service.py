import logging
from uuid import UUID, uuid4
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.automations.models import Workflow, WorkflowExecution
from app.automations.engine import WorkflowEngine

logger = logging.getLogger(__name__)

class AutomationEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def trigger_event(self, tenant_id: UUID, event_type: str, context: dict[str, Any]):
        """
        Evaluate and execute active workflows for a specific event.
        """
        try:
            stmt = select(Workflow).where(
                Workflow.tenant_id == tenant_id,
                Workflow.trigger_type == event_type,
                Workflow.is_active == True
            )
            result = await self.db.execute(stmt)
            workflows = result.scalars().all()

            for workflow in workflows:
                # Trigger a workflow execution
                execution = WorkflowExecution(
                    id=uuid4(),
                    tenant_id=tenant_id,
                    workflow_id=workflow.id,
                    contact_id=UUID(context.get("contact_id")) if context.get("contact_id") else None,
                    status="running",
                    context_data=context
                )
                self.db.add(execution)
                await self.db.commit()
                
                # Start executing steps using WorkflowEngine
                engine = WorkflowEngine(self.db)
                # We can execute asynchronously or synchronously for simple testing
                # Here we just run the execution
                await engine.run_execution(execution.id)
                
        except Exception as e:
            logger.error(f"Error triggering workflows for event {event_type}: {e}")
