import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.tenants.dependencies import get_current_tenant_id
from app.ai.models import AIAgent, ContentGeneration
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

class AIAgentResponse(BaseModel):
    id: uuid.UUID
    name: str
    agent_type: str
    provider: str
    is_active: bool
    
    class Config:
        from_attributes = True

@router.get("/agents", response_model=List[AIAgentResponse])
async def list_agents(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AIAgent).where(AIAgent.tenant_id == tenant_id))
    return result.scalars().all()

class AIAgentCreate(BaseModel):
    name: str
    agent_type: str
    provider: str = "openai"

@router.post("/agents", response_model=AIAgentResponse)
async def create_agent(
    data: AIAgentCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    agent = AIAgent(
        tenant_id=tenant_id,
        name=data.name,
        agent_type=data.agent_type,
        provider=data.provider
    )
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    return agent

class GenerateRequest(BaseModel):
    prompt: str
    content_type: str
    agent_id: uuid.UUID

@router.post("/generate-content")
async def generate_content(
    data: GenerateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    # Mocking LLM generation for now
    mock_output = f"Generated {data.content_type} based on: '{data.prompt}'. This is an AI mock output."
    
    generation = ContentGeneration(
        tenant_id=tenant_id,
        agent_id=data.agent_id,
        content_type=data.content_type,
        prompt=data.prompt,
        output=mock_output
    )
    db.add(generation)
    await db.commit()
    
    return {"output": mock_output}
