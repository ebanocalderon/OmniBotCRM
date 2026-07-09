"""
FastAPI application factory.

Creates the FastAPI application instance with all routers,
middleware, and lifecycle hooks. This is the entry point
that uvicorn loads.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.database import close_db, init_db
from app.core.middleware import register_middleware

logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifecycle."""
    settings = get_settings()

    logger.info("=== OmniBot Platform starting up ===")
    logger.info("Environment: %s", settings.environment)

    # 1. Initialize the database
    if settings.is_development:
        await init_db()
        logger.info("Database tables created (development mode)")

    # 2. Start background services (Telegram polling, etc.)
    # TODO: Phase 1 — migrate Telegram bot startup here

    yield  # Application runs here

    # Shutdown
    logger.info("=== OmniBot Platform shutting down ===")
    await close_db()
    logger.info("Database connections closed")


# ── Application Factory ──────────────────────────────────────────────────────


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    This factory pattern allows:
    - Different configurations for testing vs production
    - Clean separation of concerns
    - Easy testing with test-specific settings
    """
    settings = get_settings()

    app = FastAPI(
        title="OmniBot Platform API",
        description=(
            "AI Customer Operations Platform — CRM, Omnichannel Messaging, "
            "AI Agents, Workflow Automation, and Contact Center."
        ),
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
    )

    # Register middleware (CORS, logging, exception handlers)
    register_middleware(app)

    # Register routers
    _register_routers(app)

    return app


def _register_routers(app: FastAPI) -> None:
    """Register all API routers on the application."""

    # ── Health Check (always available) ───────────────────────────────────
    @app.get("/health", tags=["system"], summary="Liveness check")
    async def health() -> JSONResponse:
        """Returns 200 OK when the server is running."""
        return JSONResponse(
            status_code=200,
            content={
                "status": "ok",
                "version": "0.1.0",
                "platform": "OmniBot",
            },
        )

    @app.get("/", include_in_schema=False)
    async def root() -> JSONResponse:
        return JSONResponse(
            {"message": "OmniBot Platform API. See /docs for documentation."}
        )

    from app.tenants.router import router as tenants_router
    from app.crm.router import router as crm_router
    from app.messaging.router import router as messaging_router
    from app.ai.router import router as ai_router
    from app.payments.router import router as payments_router
    from app.auth.router import router as auth_router
    from app.automations.router import router as automations_router
    from app.analytics.router import router as analytics_router
    
    # Ensure all models are loaded into the SQLAlchemy registry
    from app.messaging import models as messaging_models  # noqa: F401
    from app.ai import models as ai_models  # noqa: F401
    
    api_router = APIRouter(prefix="/api/v1")
    api_router.include_router(tenants_router)
    api_router.include_router(crm_router)
    api_router.include_router(messaging_router)
    api_router.include_router(ai_router)
    api_router.include_router(payments_router)
    api_router.include_router(auth_router)
    api_router.include_router(automations_router)
    api_router.include_router(analytics_router)
    
    app.include_router(api_router)


# ── Module-level app instance (for uvicorn) ──────────────────────────────────
app = create_app()
