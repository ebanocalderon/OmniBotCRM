"""
Anthropic AI provider adapter.

Connects to the Anthropic Messages API for Claude models.
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

ANTHROPIC_API_URL = "https://api.anthropic.com/v1"
ANTHROPIC_API_VERSION = "2023-06-01"


class AnthropicProvider(AIProvider):
    """Anthropic Claude API provider adapter."""

    @property
    def name(self) -> str:
        return "anthropic"

    def _get_headers(self, config: ProviderConfig) -> dict[str, str]:
        """Build Anthropic-specific headers."""
        if not config.api_key:
            raise AIProviderError("anthropic", "API key is required")
        return {
            "x-api-key": config.api_key,
            "anthropic-version": ANTHROPIC_API_VERSION,
            "Content-Type": "application/json",
        }

    async def chat(
        self,
        messages: list[AIMessage],
        config: ProviderConfig,
    ) -> AIResponse:
        """Send a messages request to Anthropic's API."""
        url = f"{ANTHROPIC_API_URL}/messages"
        headers = self._get_headers(config)

        # Anthropic requires system prompt as a separate parameter, not in messages
        system_prompt = None
        chat_messages = []
        for m in messages:
            if m.role == "system":
                system_prompt = m.content
            else:
                chat_messages.append({"role": m.role, "content": m.content})

        payload: dict = {
            "model": config.model,
            "messages": chat_messages,
            "max_tokens": config.max_tokens,
            "temperature": config.temperature,
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()

                # Anthropic returns content as a list of content blocks
                content_blocks = data.get("content", [])
                content = "".join(
                    block.get("text", "") for block in content_blocks
                    if block.get("type") == "text"
                )

                if not content:
                    raise AIProviderError("anthropic", "Empty response from Anthropic")

                usage = data.get("usage", {})
                return AIResponse(
                    content=content,
                    model=data.get("model", config.model),
                    provider=self.name,
                    token_usage={
                        "prompt_tokens": usage.get("input_tokens", 0),
                        "completion_tokens": usage.get("output_tokens", 0),
                        "total_tokens": (
                            usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
                        ),
                    },
                    finish_reason=data.get("stop_reason"),
                )

        except httpx.ConnectError as exc:
            raise AIProviderError(
                "anthropic", "Cannot connect to Anthropic API"
            ) from exc
        except httpx.HTTPStatusError as exc:
            error_msg = exc.response.text
            try:
                error_data = exc.response.json()
                error_msg = error_data.get("error", {}).get("message", error_msg)
            except Exception:
                pass
            raise AIProviderError(
                "anthropic", f"HTTP {exc.response.status_code}: {error_msg}"
            ) from exc

    async def stream_chat(
        self,
        messages: list[AIMessage],
        config: ProviderConfig,
    ) -> AsyncGenerator[AIChunk, None]:
        """Stream a messages response from Anthropic (SSE)."""
        url = f"{ANTHROPIC_API_URL}/messages"
        headers = self._get_headers(config)

        system_prompt = None
        chat_messages = []
        for m in messages:
            if m.role == "system":
                system_prompt = m.content
            else:
                chat_messages.append({"role": m.role, "content": m.content})

        payload: dict = {
            "model": config.model,
            "messages": chat_messages,
            "max_tokens": config.max_tokens,
            "temperature": config.temperature,
            "stream": True,
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        data = json.loads(data_str)
                        event_type = data.get("type")

                        if event_type == "content_block_delta":
                            delta = data.get("delta", {})
                            text = delta.get("text", "")
                            if text:
                                yield AIChunk(content=text, is_final=False)
                        elif event_type == "message_stop":
                            yield AIChunk(content="", is_final=True)
                            return

        except httpx.ConnectError as exc:
            raise AIProviderError(
                "anthropic", "Cannot connect to Anthropic API"
            ) from exc

    async def list_models(self, config: ProviderConfig) -> list[ModelInfo]:
        """Return known Anthropic models (Anthropic doesn't have a list endpoint)."""
        return [
            ModelInfo(name="claude-sonnet-4-20250514", provider=self.name, description="Claude Sonnet 4"),
            ModelInfo(name="claude-opus-4-20250514", provider=self.name, description="Claude Opus 4"),
            ModelInfo(name="claude-3-5-haiku-20241022", provider=self.name, description="Claude 3.5 Haiku"),
        ]
