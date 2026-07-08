"""
FastAPI dependency injection.

Central place for all shared dependencies used across routes.
Keeps route definitions clean by extracting common logic.
"""
from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.middleware import TenantContext, get_tenant_context
from app.core.pagination import PaginationParams

# ── Database Session ──────────────────────────────────────────────────────────

DbSession = Annotated[AsyncSession, Depends(get_db_session)]

# ── Tenant Context ────────────────────────────────────────────────────────────

CurrentTenant = Annotated[TenantContext, Depends(get_tenant_context)]

# ── Pagination ────────────────────────────────────────────────────────────────

Pagination = Annotated[PaginationParams, Depends()]
