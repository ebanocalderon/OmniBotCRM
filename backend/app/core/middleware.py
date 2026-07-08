"""
FastAPI middleware stack for the OmniBot Platform.

Middlewares are applied in reverse order (last added = first executed).
Order matters: CORS → Request logging → Tenant injection → Exception handling.
"""
from __future__ import annotations

import logging
import time
import uuid
from typing import Optional
from uuid import UUID

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.core.exceptions import PlatformError

logger = logging.getLogger(__name__)


# ── Tenant Context ────────────────────────────────────────────────────────────
# Stored in request.state for access throughout the request lifecycle.


class TenantContext:
    """Holds the resolved tenant for the current request."""

    def __init__(
        self,
        tenant_id: UUID,
        user_id: Optional[UUID] = None,
        roles: Optional[list[str]] = None,
    ) -> None:
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.roles = roles or []


def get_tenant_context(request: Request) -> TenantContext:
    """
    Extract tenant context from the request state.
    Raises PlatformError if no tenant context exists (unauthenticated request).
    """
    ctx = getattr(request.state, "tenant", None)
    if ctx is None:
        raise PlatformError(
            "Tenant context not available",
            code="TENANT_CONTEXT_MISSING",
            status_code=401,
        )
    return ctx


# ── Request Logging Middleware ────────────────────────────────────────────────


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs every HTTP request with timing, status code, and request ID.
    Adds X-Request-ID header for distributed tracing.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start_time) * 1000

        response.headers["X-Request-ID"] = request_id

        logger.info(
            "%s %s → %d (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(elapsed_ms, 1),
            },
        )
        return response


# ── Exception Handler ─────────────────────────────────────────────────────────


class MockAuthMiddleware(BaseHTTPMiddleware):
    """
    Mock authentication for development.
    Automatically injects a TenantContext with admin roles so the API can be tested
    without Keycloak running.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        from app.core.config import get_settings
        settings = get_settings()
        
        if settings.is_development:
            # Inject a mock tenant context for local testing
            request.state.tenant = TenantContext(
                tenant_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
                user_id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
                roles=["platform_admin", "tenant_owner", "admin"],
            )

        return await call_next(request)


async def platform_exception_handler(request: Request, exc: PlatformError) -> JSONResponse:
    """
    Translates PlatformError exceptions into consistent JSON error responses.
    Registered as a FastAPI exception handler.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


# ── Middleware Registration ──────────────────────────────────────────────────


def register_middleware(app: FastAPI) -> None:
    """
    Register all middleware on the FastAPI application.
    Called from the application factory in main.py.
    """
    # CORS — allow frontend to communicate with API
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # TODO: restrict in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging
    app.add_middleware(RequestLoggingMiddleware)
    
    # Mock Auth for Development
    app.add_middleware(MockAuthMiddleware)

    # Exception handlers
    app.add_exception_handler(PlatformError, platform_exception_handler)
