from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, Any

class AutomationRuleBase(BaseModel):
    name: str
    trigger_event: str
    trigger_condition: dict[str, Any]
    action_type: str
    action_config: dict[str, Any]
    is_active: bool = True

class AutomationRuleCreate(AutomationRuleBase):
    pass

class AutomationRuleUpdate(BaseModel):
    name: Optional[str] = None
    trigger_event: Optional[str] = None
    trigger_condition: Optional[dict[str, Any]] = None
    action_type: Optional[str] = None
    action_config: Optional[dict[str, Any]] = None
    is_active: Optional[bool] = None

class AutomationRuleResponse(AutomationRuleBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
