"""
OpenAI AI provider adapter.

Connects to the OpenAI API (or any OpenAI-compatible API like OpenRouter).
"""
from __future__ import annotations

import json
import logging
from typing import AsyncGenerator

import httpx

from app.ai.providers.base import (
    AIChunk,
    AIMessage,
    AIProvider,
    AIResponse,
    ModelInfo,
    ProviderConfig,
)
from app.core.exceptions import AIProviderError

logger = logging.getLogger(__name__)

# Default API endpoint
OPENAI_API_URL = "https://api.openai.com/v1"


class OpenAIProvider(AIProvider):
    """OpenAI API provider adapter (also works with OpenAI-compatible APIs)."""

    @property
    def name(self) -> str:
        return "openai"

    def _get_headers(self, config: ProviderConfig) -> dict[str, str]:
        """Build authorization headers."""
        if not config.api_key:
            raise AIProviderError("openai", "API key is required")
        return {
            "Authorization": f"Bearer {config.api_key}",
            "Content-Type": "application/json",
        }

    def _get_base_url(self, config: ProviderConfig) -> str:
        """Get the API base URL (supports custom endpoints like OpenRouter)."""
        return (config.base_url or OPENAI_API_URL).rstrip("/")

    async def chat(
        self,
        messages: list[AIMessage],
        config: ProviderConfig,
    ) -> AIResponse:
        """Send a chat completion request to OpenAI."""
        base_url = self._get_base_url(config)
        url = f"{base_url}/chat/completions"
        headers = self._get_headers(config)

        payload = {
            "model": config.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": config.temperature,
            "max_tokens": config.max_tokens,
        }

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()

                choice = data.get("choices", [{}])[0]
                content = choice.get("message", {}).get("content", "")

                if not content:
                    raise AIProviderError("openai", "Empty response from OpenAI")

                usage = data.get("usage", {})
                return AIResponse(
                    content=content,
                    model=data.get("model", config.model),
                    provider=self.name,
                    token_usage={
                        "prompt_tokens": usage.get("prompt_tokens", 0),
                        "completion_tokens": usage.get("completion_tokens", 0),
                        "total_tokens": usage.get("total_tokens", 0),
                    },
                    finish_reason=choice.get("finish_reason"),
                )

        except httpx.ConnectError as exc:
            raise AIProviderError(
                "openai", f"Cannot connect to OpenAI API at {base_url}"
            ) from exc
        except httpx.HTTPStatusError as exc:
            error_body = exc.response.text
            try:
                error_data = exc.response.json()
                error_msg = error_data.get("error", {}).get("message", error_body)
            except Exception:
                error_msg = error_body
            raise AIProviderError(
                "openai", f"HTTP {exc.response.status_code}: {error_msg}"
            ) from exc

    async def stream_chat(
        self,
        messages: list[AIMessage],
        config: ProviderConfig,
    ) -> AsyncGenerator[AIChunk, None]:
        """Stream a chat completion response from OpenAI."""
        base_url = self._get_base_url(config)
        url = f"{base_url}/chat/completions"
        headers = self._get_headers(config)

        payload = {
            "model": config.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": config.temperature,
            "max_tokens": config.max_tokens,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:]  # Remove "data: " prefix
                        if data_str == "[DONE]":
                            yield AIChunk(content="", is_final=True)
                            return
                        data = json.loads(data_str)
                        delta = data.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield AIChunk(content=content, is_final=False)

        except httpx.ConnectError as exc:
            raise AIProviderError(
                "openai", f"Cannot connect to OpenAI API at {base_url}"
            ) from exc

    async def list_models(self, config: ProviderConfig) -> list[ModelInfo]:
        """List available models from OpenAI."""
        base_url = self._get_base_url(config)
        url = f"{base_url}/models"
        headers = self._get_headers(config)

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                data = resp.json()

                # Filter to chat-capable models only
                chat_models = [
                    m for m in data.get("data", [])
                    if "gpt" in m.get("id", "").lower()
                    or "o1" in m.get("id", "").lower()
                    or "o3" in m.get("id", "").lower()
                ]

                return [
                    ModelInfo(
                        name=m["id"],
                        provider=self.name,
                    )
                    for m in chat_models
                ]

        except Exception as exc:
            logger.warning("Failed to list OpenAI models: %s", exc)
            return []
