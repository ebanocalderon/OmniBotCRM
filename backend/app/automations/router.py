import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.tenants.dependencies import get_current_tenant_id
from app.automations.models import Workflow, WorkflowStep, WorkflowExecution
from pydantic import BaseModel

router = APIRouter(prefix="/automations", tags=["automations"])

class WorkflowResponse(BaseModel):
    id: uuid.UUID
    name: str
    is_active: bool
    trigger_type: str
    
    class Config:
        orm_mode = True
        from_attributes = True

@router.get("/workflows", response_model=List[WorkflowResponse])
async def list_workflows(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Workflow).where(Workflow.tenant_id == tenant_id))
    return result.scalars().all()

@router.post("/workflows/{workflow_id}/trigger")
async def trigger_workflow(
    workflow_id: uuid.UUID,
    contact_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    # Fetch workflow and first step
    wf_result = await db.execute(select(Workflow).where(Workflow.id == workflow_id, Workflow.tenant_id == tenant_id))
    workflow = wf_result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    step_result = await db.execute(select(WorkflowStep).where(WorkflowStep.workflow_id == workflow_id).limit(1))
    first_step = step_result.scalar_one_or_none()
    
    if not first_step:
        raise HTTPException(status_code=400, detail="Workflow has no steps")
        
    # Create execution
    execution = WorkflowExecution(
        workflow_id=workflow_id,
        contact_id=contact_id,
        current_step_id=first_step.id,
        status="running"
    )
    db.add(execution)
    await db.commit()
    await db.refresh(execution)
    
    # Enqueue execution
    from app.automations.scheduler import enqueue_workflow_execution
    await enqueue_workflow_execution(str(execution.id))
    
    return {"message": "Workflow triggered", "execution_id": execution.id}
