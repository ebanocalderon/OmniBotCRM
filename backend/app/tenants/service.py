"""
Tenant domain — service layer.

Business logic for managing tenants and users.
"""
from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.tenants.models import Tenant, User
from app.tenants.schemas import TenantCreate, TenantUpdate, UserCreate, UserUpdate


class TenantService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_tenant(self, tenant_id: uuid.UUID) -> Tenant:
        tenant = await self.db.get(Tenant, tenant_id)
        if not tenant:
            raise NotFoundError("Tenant", tenant_id)
        return tenant

    async def get_tenant_by_slug(self, slug: str) -> Optional[Tenant]:
        stmt = select(Tenant).where(Tenant.slug == slug)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create_tenant(self, data: TenantCreate) -> Tenant:
        existing = await self.get_tenant_by_slug(data.slug)
        if existing:
            raise ConflictError(f"Tenant with slug '{data.slug}' already exists")

        tenant = Tenant(
            name=data.name,
            slug=data.slug,
            plan=data.plan or "free",
        )
        self.db.add(tenant)
        await self.db.flush()
        return tenant

    async def update_tenant(self, tenant_id: uuid.UUID, data: TenantUpdate) -> Tenant:
        tenant = await self.get_tenant(tenant_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(tenant, key, value)

        await self.db.flush()
        return tenant


class UserService:
    def __init__(self, db: AsyncSession, tenant_id: uuid.UUID):
        self.db = db
        self.tenant_id = tenant_id

    async def get_user(self, user_id: uuid.UUID) -> User:
        stmt = select(User).where(
            User.id == user_id, User.tenant_id == self.tenant_id
        )
        result = await self.db.execute(stmt)
        user = result.scalars().first()
        if not user:
            raise NotFoundError("User", user_id)
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(
            User.email == email, User.tenant_id == self.tenant_id
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create_user(self, data: UserCreate) -> User:
        existing = await self.get_user_by_email(data.email)
        if existing:
            raise ConflictError(f"User with email '{data.email}' already exists in this tenant")

        user = User(
            tenant_id=self.tenant_id,
            email=data.email,
            name=data.name,
            role=data.role or "agent",
            keycloak_user_id=data.keycloak_user_id,
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def update_user(self, user_id: uuid.UUID, data: UserUpdate) -> User:
        user = await self.get_user(user_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)

        await self.db.flush()
        return user
