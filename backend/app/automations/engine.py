import uuid
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.automations.models import WorkflowExecution, WorkflowExecutionLog, WorkflowStep

class WorkflowEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def execute_step(self, execution: WorkflowExecution, step: WorkflowStep) -> Optional[uuid.UUID]:
        """
        Executes a single workflow step and returns the ID of the next step to execute.
        Returns None if the workflow is completed or paused (e.g. for a delay).
        """
        log = WorkflowExecutionLog(
            execution_id=execution.id,
            step_id=step.id,
            input_data={"context": execution.context_data, "config": step.config},
            status="running"
        )
        self.db.add(log)
        
        next_step_id = step.next_step_id
        
        try:
            # Handle different step types
            if step.step_type == "delay":
                # Pause execution. The scheduler will pick it up later.
                execution.status = "paused"
                log.status = "success"
                log.output_data = {"message": "Execution paused for delay"}
                next_step_id = None
                
            elif step.step_type == "action":
                if step.action_type == "add_tag":
                    # Mock add tag
                    log.output_data = {"tag_added": step.config.get("tag_name")}
                elif step.action_type == "send_email":
                    # Mock send email
                    log.output_data = {"email_sent": True}
                else:
                    log.output_data = {"message": f"Action {step.action_type} executed"}
                log.status = "success"
                
            elif step.step_type == "condition":
                if step.action_type == "if_else":
                    # Evaluate condition (mock evaluation)
                    condition_met = True # For now, always take the true branch
                    if not condition_met:
                        next_step_id = step.else_step_id
                log.status = "success"
                
            else:
                log.status = "error"
                log.error_message = f"Unknown step_type: {step.step_type}"
                
        except Exception as e:
            log.status = "error"
            log.error_message = str(e)
            execution.status = "failed"
            next_step_id = None
            
        await self.db.commit()
        return next_step_id

    async def run_execution(self, execution_id: uuid.UUID):
        """
        Runs an execution forward until it completes or hits a delay/pause.
        """
        result = await self.db.execute(
            select(WorkflowExecution).where(WorkflowExecution.id == execution_id)
        )
        execution = result.scalar_one_or_none()
        if not execution or execution.status not in ["running", "paused"]:
            return

        if execution.status == "paused":
            execution.status = "running"

        current_step_id = execution.current_step_id

        while current_step_id:
            step_result = await self.db.execute(
                select(WorkflowStep).where(WorkflowStep.id == current_step_id)
            )
            step = step_result.scalar_one_or_none()
            
            if not step:
                execution.status = "failed"
                break
                
            current_step_id = await self.execute_step(execution, step)
            execution.current_step_id = current_step_id
            
            if not current_step_id and execution.status == "running":
                execution.status = "completed"
                import datetime
                execution.completed_at = datetime.datetime.utcnow()
                
            await self.db.commit()
