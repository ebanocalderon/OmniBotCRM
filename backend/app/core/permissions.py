"""
RBAC permission enforcement.

Defines the permission model and provides decorators/dependencies
for protecting FastAPI endpoints based on user roles.

Phase 1: Simple role-based checks (admin, supervisor, agent).
Phase 5: Extend to custom roles with field-level permissions.
"""
from __future__ import annotations

import logging
from enum import StrEnum
from functools import wraps
from typing import Callable

from fastapi import Depends, Request

from app.core.exceptions import AuthorizationError
from app.core.middleware import TenantContext, get_tenant_context

logger = logging.getLogger(__name__)


class Role(StrEnum):
    """Built-in platform roles, ordered by privilege level."""

    PLATFORM_ADMIN = "platform_admin"
    TENANT_OWNER = "tenant_owner"
    ADMIN = "admin"
    SUPERVISOR = "supervisor"
    AGENT = "agent"
    AI_AGENT = "ai_agent"
    API_CONSUMER = "api_consumer"


# Privilege hierarchy: higher roles inherit lower roles' permissions
ROLE_HIERARCHY: dict[Role, int] = {
    Role.PLATFORM_ADMIN: 100,
    Role.TENANT_OWNER: 90,
    Role.ADMIN: 80,
    Role.SUPERVISOR: 60,
    Role.AGENT: 40,
    Role.AI_AGENT: 30,
    Role.API_CONSUMER: 20,
}


def has_role(user_roles: list[str], required_role: Role) -> bool:
    """
    Check if any of the user's roles meets the required privilege level.
    Uses the role hierarchy — a TENANT_OWNER automatically has AGENT access.
    """
    required_level = ROLE_HIERARCHY.get(required_role, 0)
    for role in user_roles:
        try:
            user_level = ROLE_HIERARCHY.get(Role(role), 0)
        except ValueError:
            continue  # Unknown role, skip
        if user_level >= required_level:
            return True
    return False


def require_role(minimum_role: Role) -> Callable:
    """
    FastAPI dependency that enforces a minimum role on a route.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_role(Role.ADMIN))])
        async def admin_only():
            ...
    """

    async def _check(request: Request) -> None:
        ctx = get_tenant_context(request)
        if not has_role(ctx.roles, minimum_role):
            logger.warning(
                "Authorization denied: user=%s roles=%s required=%s path=%s",
                ctx.user_id,
                ctx.roles,
                minimum_role,
                request.url.path,
            )
            raise AuthorizationError(
                f"Requires role '{minimum_role.value}' or higher"
            )

    return _check
