"""
Abstract base class for AI provider adapters.

Every AI provider (Ollama, OpenAI, Anthropic, Gemini, OpenRouter)
must implement this interface. This ensures the AI service can
swap providers without changing any business logic.
"""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, AsyncGenerator, Optional

logger = logging.getLogger(__name__)


@dataclass
class AIMessage:
    """A single message in the AI conversation."""

    role: str  # system | user | assistant
    content: str


@dataclass
class AIResponse:
    """Response from an AI provider."""

    content: str
    model: str
    provider: str
    token_usage: Optional[dict[str, int]] = None  # prompt_tokens, completion_tokens, total_tokens
    finish_reason: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class AIChunk:
    """A single chunk in a streaming AI response."""

    content: str
    is_final: bool = False


@dataclass
class ModelInfo:
    """Information about an available AI model."""

    name: str
    provider: str
    size: Optional[str] = None  # e.g. "7B", "70B"
    context_length: Optional[int] = None
    description: Optional[str] = None


@dataclass
class ProviderConfig:
    """Configuration for a specific AI provider instance."""

    api_key: Optional[str] = None
    base_url: Optional[str] = None
    model: str = ""
    temperature: float = 0.7
    max_tokens: int = 2048
    extra: dict[str, Any] = field(default_factory=dict)


class AIProvider(ABC):
    """
    Abstract interface for AI provider adapters.

    Each provider implementation translates between our internal
    message format and the provider's specific API.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier (e.g. 'ollama', 'openai', 'anthropic')."""
        ...

    @abstractmethod
    async def chat(
        self,
        messages: list[AIMessage],
        config: ProviderConfig,
    ) -> AIResponse:
        """
        Send a conversation to the AI and return the complete response.

        Args:
            messages: Ordered conversation history including system prompt.
            config: Provider-specific configuration.

        Returns:
            AIResponse with the generated content and metadata.

        Raises:
            AIProviderError: If the provider returns an error.
        """
        ...

    @abstractmethod
    async def stream_chat(
        self,
        messages: list[AIMessage],
        config: ProviderConfig,
    ) -> AsyncGenerator[AIChunk, None]:
        """
        Stream a conversation response token-by-token.

        Used for real-time typing indicators in the frontend.

        Yields:
            AIChunk objects, with is_final=True on the last chunk.
        """
        ...
        yield  # pragma: no cover — required for async generator type hint

    @abstractmethod
    async def list_models(self, config: ProviderConfig) -> list[ModelInfo]:
        """
        List available models from this provider.

        Used to populate model selection dropdowns in the admin UI.
        """
        ...

    async def health_check(self, config: ProviderConfig) -> bool:
        """
        Check if the provider is reachable and operational.
        Default implementation tries to list models.
        """
        try:
            models = await self.list_models(config)
            return len(models) > 0
        except Exception:
            return False
