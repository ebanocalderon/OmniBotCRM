import uuid
from fastapi import Depends
from app.dependencies import CurrentTenant

async def get_current_tenant_id(tenant_ctx: CurrentTenant) -> uuid.UUID:
    return tenant_ctx.tenant_id
