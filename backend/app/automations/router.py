from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.tenants.models import User
from app.automations.models import AutomationRule
from app.automations.schemas import AutomationRuleCreate, AutomationRuleUpdate, AutomationRuleResponse

router = APIRouter(prefix="/automations", tags=["automations"])

@router.get("", response_model=List[AutomationRuleResponse])
async def list_automations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AutomationRule).where(AutomationRule.tenant_id == current_user.tenant_id).order_by(AutomationRule.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=AutomationRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_automation(
    rule_in: AutomationRuleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    rule = AutomationRule(
        tenant_id=current_user.tenant_id,
        name=rule_in.name,
        trigger_event=rule_in.trigger_event,
        trigger_condition=rule_in.trigger_condition,
        action_type=rule_in.action_type,
        action_config=rule_in.action_config,
        is_active=rule_in.is_active
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule

@router.put("/{rule_id}", response_model=AutomationRuleResponse)
async def update_automation(
    rule_id: UUID,
    rule_in: AutomationRuleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AutomationRule).where(
        AutomationRule.id == rule_id, 
        AutomationRule.tenant_id == current_user.tenant_id
    )
    result = await db.execute(stmt)
    rule = result.scalar_one_or_none()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")
        
    update_data = rule_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rule, key, value)
        
    await db.commit()
    await db.refresh(rule)
    return rule

@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_automation(
    rule_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AutomationRule).where(
        AutomationRule.id == rule_id, 
        AutomationRule.tenant_id == current_user.tenant_id
    )
    result = await db.execute(stmt)
    rule = result.scalar_one_or_none()
    
    if not rule:
        raise HTTPException(status_code=404, detail="Automation rule not found")
        
    await db.delete(rule)
    await db.commit()
