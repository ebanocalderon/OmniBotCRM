"""
Platform configuration via pydantic-settings.

All values are loaded from environment variables (or a .env file).
Settings are grouped by domain to keep the configuration organized
as the platform grows. Each domain module may reference these settings
through dependency injection rather than importing the global singleton.
"""
from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the OmniBot Platform."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Platform ──────────────────────────────────────────────────────────────
    platform_name: str = Field(
        default="OmniBot", description="Platform display name (used in emails, UI)"
    )
    environment: str = Field(
        default="development", description="Runtime environment: development | staging | production"
    )
    debug: bool = Field(default=False, description="Enable debug mode (extra logging, stack traces)")
    secret_key: str = Field(
        default="CHANGE-ME-IN-PRODUCTION",
        description="Master secret for encryption (Fernet key derivation, JWT signing fallback)",
    )

    # ── Database (PostgreSQL) ─────────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql+asyncpg://omnibot:omnibot@localhost:5432/omnibot",
        description="Async SQLAlchemy database URL",
    )
    database_pool_size: int = Field(default=20, description="Connection pool size")
    database_max_overflow: int = Field(default=10, description="Max overflow connections")
    database_echo: bool = Field(default=False, description="Echo SQL statements (debug only)")

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_url: str = Field(
        default="redis://localhost:6379/0", description="Redis connection URL"
    )

    # ── Keycloak (Auth) ───────────────────────────────────────────────────────
    keycloak_server_url: str = Field(
        default="http://localhost:8080", description="Keycloak base URL"
    )
    keycloak_realm: str = Field(default="omnibot", description="Keycloak realm name")
    keycloak_client_id: str = Field(
        default="omnibot-api", description="Keycloak client ID for the backend"
    )
    keycloak_client_secret: str = Field(
        default="", description="Keycloak client secret (confidential client)"
    )
    keycloak_admin_username: str = Field(default="admin", description="Keycloak admin username")
    keycloak_admin_password: str = Field(default="admin", description="Keycloak admin password")

    # ── Chatwoot ──────────────────────────────────────────────────────────────
    chatwoot_base_url: str = Field(
        default="http://localhost:3000",
        description="Base URL of the Chatwoot instance (no trailing slash)",
    )
    chatwoot_api_token: str = Field(default="", description="Chatwoot API access token")
    chatwoot_account_id: int = Field(default=1, description="Chatwoot numeric account ID")
    chatwoot_webhook_secret: str = Field(
        default="", description="Shared secret for Chatwoot webhook validation"
    )

    # ── Telegram ──────────────────────────────────────────────────────────────
    telegram_bot_token: str = Field(default="", description="Telegram Bot API token")

    # ── AI Defaults ───────────────────────────────────────────────────────────
    ai_default_provider: str = Field(
        default="ollama", description="Default AI provider (ollama, openai, anthropic)"
    )
    ai_default_model: str = Field(default="llama3", description="Default model name")
    ai_default_system_prompt: str = Field(
        default=(
            "You are a helpful support assistant. Be concise, friendly, "
            "and answer in the same language the user writes to you."
        ),
        description="Default system prompt for AI conversations",
    )
    ai_default_max_history: int = Field(
        default=20, description="Default max conversation turns for AI memory"
    )

    # Provider-specific defaults (used when no per-inbox config exists)
    ollama_base_url: str = Field(
        default="http://localhost:11434", description="Ollama API base URL"
    )
    openai_api_key: str = Field(default="", description="OpenAI API key (encrypted at rest)")
    anthropic_api_key: str = Field(default="", description="Anthropic API key (encrypted at rest)")

    # ── Server ────────────────────────────────────────────────────────────────
    server_host: str = Field(default="0.0.0.0", description="Host to bind the API server")
    server_port: int = Field(default=8000, description="Port for the API server")

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = Field(default="INFO", description="Python logging level")
    log_format: str = Field(
        default="json", description="Log format: json (production) | console (development)"
    )

    # ── Storage ───────────────────────────────────────────────────────────────
    storage_backend: str = Field(
        default="local", description="File storage backend: local | s3"
    )
    storage_local_path: str = Field(
        default="./uploads", description="Local file storage path"
    )
    s3_endpoint_url: Optional[str] = Field(
        default=None, description="S3/MinIO endpoint URL"
    )
    s3_bucket_name: str = Field(default="omnibot", description="S3 bucket name")
    s3_access_key: str = Field(default="", description="S3 access key")
    s3_secret_key: str = Field(default="", description="S3 secret key")

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"environment must be one of {allowed}")
        return v

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()
