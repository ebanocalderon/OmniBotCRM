from pydantic import BaseModel
from typing import List

class StageData(BaseModel):
    name: str
    value: int

class StatusData(BaseModel):
    name: str
    value: int

class DashboardResponse(BaseModel):
    total_revenue: float
    active_opportunities: int
    total_contacts: int
    total_conversations: int
    opportunities_by_stage: List[StageData]
    leads_by_status: List[StatusData]
