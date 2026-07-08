"""
Custom exception hierarchy for the OmniBot Platform.

All platform-specific exceptions extend PlatformError.
FastAPI exception handlers translate these into proper HTTP responses.
"""
from __future__ import annotations

from typing import Any, Optional
from uuid import UUID


class PlatformError(Exception):
    """Base exception for all platform errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred",
        *,
        code: str = "PLATFORM_ERROR",
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


# ── Authentication & Authorization ────────────────────────────────────────────


class AuthenticationError(PlatformError):
    """Raised when authentication fails (invalid/expired token)."""

    def __init__(self, message: str = "Authentication required") -> None:
        super().__init__(message, code="AUTHENTICATION_REQUIRED", status_code=401)


class AuthorizationError(PlatformError):
    """Raised when the user lacks permission for the requested action."""

    def __init__(self, message: str = "Insufficient permissions") -> None:
        super().__init__(message, code="FORBIDDEN", status_code=403)


class InvalidTokenError(AuthenticationError):
    """Raised when the JWT token is malformed or expired."""

    def __init__(self, message: str = "Invalid or expired token") -> None:
        super().__init__(message)
        self.code = "INVALID_TOKEN"


# ── Resource Errors ───────────────────────────────────────────────────────────


class NotFoundError(PlatformError):
    """Raised when a requested resource does not exist."""

    def __init__(
        self,
        resource_type: str = "Resource",
        resource_id: Optional[UUID | str | int] = None,
    ) -> None:
        msg = f"{resource_type} not found"
        if resource_id:
            msg = f"{resource_type} '{resource_id}' not found"
        super().__init__(msg, code="NOT_FOUND", status_code=404)


class ConflictError(PlatformError):
    """Raised when an operation conflicts with existing state (e.g. duplicate email)."""

    def __init__(self, message: str = "Resource conflict") -> None:
        super().__init__(message, code="CONFLICT", status_code=409)


class ValidationError(PlatformError):
    """Raised when input data fails business-logic validation."""

    def __init__(
        self,
        message: str = "Validation failed",
        *,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(message, code="VALIDATION_ERROR", status_code=422, details=details)


# ── Tenant Errors ─────────────────────────────────────────────────────────────


class TenantNotFoundError(NotFoundError):
    """Raised when the tenant cannot be resolved from the request."""

    def __init__(self) -> None:
        super().__init__(resource_type="Tenant")
        self.code = "TENANT_NOT_FOUND"


class TenantSuspendedError(PlatformError):
    """Raised when a tenant's account is suspended."""

    def __init__(self) -> None:
        super().__init__(
            "This account has been suspended",
            code="TENANT_SUSPENDED",
            status_code=403,
        )


# ── External Service Errors ──────────────────────────────────────────────────


class ExternalServiceError(PlatformError):
    """Raised when an external service (Chatwoot, Ollama, OpenAI) fails."""

    def __init__(
        self,
        service_name: str,
        message: str = "External service unavailable",
        *,
        status_code: int = 502,
    ) -> None:
        super().__init__(
            f"{service_name}: {message}",
            code="EXTERNAL_SERVICE_ERROR",
            status_code=status_code,
        )
        self.service_name = service_name


class AIProviderError(ExternalServiceError):
    """Raised when an AI provider returns an error."""

    def __init__(self, provider: str, message: str = "AI provider error") -> None:
        super().__init__(provider, message)
        self.code = "AI_PROVIDER_ERROR"


class ChatwootError(ExternalServiceError):
    """Raised when Chatwoot API returns an error."""

    def __init__(self, message: str = "Chatwoot API error") -> None:
        super().__init__("Chatwoot", message)
        self.code = "CHATWOOT_ERROR"


# ── Rate Limiting ─────────────────────────────────────────────────────────────


class RateLimitError(PlatformError):
    """Raised when a tenant exceeds their API rate limit."""

    def __init__(self, retry_after: int = 60) -> None:
        super().__init__(
            f"Rate limit exceeded. Retry after {retry_after} seconds.",
            code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            details={"retry_after": retry_after},
        )


# ── Usage / Billing ──────────────────────────────────────────────────────────


class UsageLimitError(PlatformError):
    """Raised when a tenant exceeds their plan's usage limits (e.g. AI tokens)."""

    def __init__(self, limit_type: str = "usage") -> None:
        super().__init__(
            f"Plan {limit_type} limit exceeded. Please upgrade your plan.",
            code="USAGE_LIMIT_EXCEEDED",
            status_code=402,
        )
