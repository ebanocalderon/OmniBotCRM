"""
Tenant domain — FastAPI router.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends

from app.core.pagination import PaginatedResponse, paginate_query
from app.core.permissions import Role, require_role
from app.dependencies import CurrentTenant, DbSession, Pagination
from app.tenants.models import Tenant, User
from app.tenants.schemas import (
    TenantCreate,
    TenantResponse,
    TenantUpdate,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.tenants.service import TenantService, UserService
from sqlalchemy import select

router = APIRouter(prefix="/tenants", tags=["tenants"])

# ── Tenants ───────────────────────────────────────────────────────────────────


@router.get("/current", response_model=TenantResponse)
async def get_current_tenant(
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> TenantResponse:
    """Get the current tenant based on the authenticated request."""
    service = TenantService(db)
    return await service.get_tenant(tenant_ctx.tenant_id)


@router.patch(
    "/current",
    response_model=TenantResponse,
    dependencies=[Depends(require_role(Role.ADMIN))],
)
async def update_current_tenant(
    data: TenantUpdate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> TenantResponse:
    """Update settings for the current tenant (requires Admin)."""
    service = TenantService(db)
    return await service.update_tenant(tenant_ctx.tenant_id, data)


# (System Admin only)
@router.post(
    "/",
    response_model=TenantResponse,
    dependencies=[Depends(require_role(Role.PLATFORM_ADMIN))],
)
async def create_new_tenant(data: TenantCreate, db: DbSession) -> TenantResponse:
    """Create a new tenant organization (requires Platform Admin)."""
    service = TenantService(db)
    return await service.create_tenant(data)


# ── Users ─────────────────────────────────────────────────────────────────────


@router.get("/current/users", response_model=PaginatedResponse[UserResponse])
async def list_users(
    db: DbSession,
    tenant_ctx: CurrentTenant,
    pagination: Pagination,
) -> dict:
    """List all users in the current tenant."""
    query = select(User).where(User.tenant_id == tenant_ctx.tenant_id)
    return await paginate_query(db, query, pagination)


@router.post(
    "/current/users",
    response_model=UserResponse,
    dependencies=[Depends(require_role(Role.ADMIN))],
)
async def create_user(
    data: UserCreate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> UserResponse:
    """Invite/create a new user in the current tenant (requires Admin)."""
    service = UserService(db, tenant_ctx.tenant_id)
    return await service.create_user(data)


@router.get("/current/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> UserResponse:
    """Get a specific user's details."""
    service = UserService(db, tenant_ctx.tenant_id)
    return await service.get_user(user_id)


@router.patch("/current/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    db: DbSession,
    tenant_ctx: CurrentTenant,
) -> UserResponse:
    """
    Update a user's details.
    Users can update themselves; Admins can update anyone.
    """
    # Simple self-service check
    if tenant_ctx.user_id != user_id and not "admin" in tenant_ctx.roles:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("You can only update your own profile")

    service = UserService(db, tenant_ctx.tenant_id)
    return await service.update_user(user_id, data)
