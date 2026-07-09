from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.tenants.models import User
from app.crm.models import Opportunity, Contact, Lead
from app.messaging.models import Conversation
from app.analytics.schemas import DashboardResponse, StageData, StatusData

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tenant_id = current_user.tenant_id

    # 1. Total Revenue (Closed Won Opportunities)
    stmt_rev = select(func.sum(Opportunity.amount)).where(
        Opportunity.tenant_id == tenant_id,
        Opportunity.stage == "Closed Won"
    )
    rev_result = await db.execute(stmt_rev)
    total_revenue = rev_result.scalar() or 0.0

    # 2. Active Opportunities (Not Won or Lost)
    stmt_active_opp = select(func.count(Opportunity.id)).where(
        Opportunity.tenant_id == tenant_id,
        Opportunity.stage.notin_(["Closed Won", "Closed Lost"])
    )
    active_opp_result = await db.execute(stmt_active_opp)
    active_opportunities = active_opp_result.scalar() or 0

    # 3. Total Contacts
    stmt_contacts = select(func.count(Contact.id)).where(Contact.tenant_id == tenant_id)
    contacts_result = await db.execute(stmt_contacts)
    total_contacts = contacts_result.scalar() or 0

    # 4. Total Conversations
    stmt_conversations = select(func.count(Conversation.id)).where(Conversation.tenant_id == tenant_id)
    conv_result = await db.execute(stmt_conversations)
    total_conversations = conv_result.scalar() or 0

    # 5. Opportunities by Stage
    stmt_stages = select(Opportunity.stage, func.count(Opportunity.id)).where(
        Opportunity.tenant_id == tenant_id
    ).group_by(Opportunity.stage)
    stages_result = await db.execute(stmt_stages)
    stages_data = [{"name": row[0], "value": row[1]} for row in stages_result.all()]

    # 6. Leads by Status
    stmt_leads = select(Lead.status, func.count(Lead.id)).where(
        Lead.tenant_id == tenant_id
    ).group_by(Lead.status)
    leads_result = await db.execute(stmt_leads)
    leads_data = [{"name": row[0], "value": row[1]} for row in leads_result.all()]

    return DashboardResponse(
        total_revenue=float(total_revenue),
        active_opportunities=active_opportunities,
        total_contacts=total_contacts,
        total_conversations=total_conversations,
        opportunities_by_stage=stages_data,
        leads_by_status=leads_data
    )
