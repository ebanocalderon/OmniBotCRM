"""
Ollama AI provider adapter.

Connects to a locally-running Ollama instance for inference.
Migrated from the original bridge's app/ai/client.py.
"""
from __future__ import annotations

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


class OllamaProvider(AIProvider):
    """Ollama local LLM provider adapter."""

    @property
    def name(self) -> str:
        return "ollama"

    async def chat(
        self,
        messages: list[AIMessage],
        config: ProviderConfig,
    ) -> AIResponse:
        """Send a chat request to Ollama's /api/chat endpoint."""
        base_url = (config.base_url or "http://localhost:11434").rstrip("/")
        url = f"{base_url}/api/chat"

        payload = {
            "model": config.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": False,
            "options": {
                "temperature": config.temperature,
                "num_predict": config.max_tokens,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()

                content = data.get("message", {}).get("content", "")
                if not content:
                    raise AIProviderError("ollama", "Empty response from Ollama")

                return AIResponse(
                    content=content,
                    model=config.model,
                    provider=self.name,
                    token_usage={
                        "prompt_tokens": data.get("prompt_eval_count", 0),
                        "completion_tokens": data.get("eval_count", 0),
                        "total_tokens": (
                            data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
                        ),
                    },
                    finish_reason="stop",
                )

        except httpx.ConnectError as exc:
            raise AIProviderError(
                "ollama", f"Cannot connect to Ollama at {base_url}"
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise AIProviderError(
                "ollama", f"HTTP {exc.response.status_code}: {exc.response.text}"
            ) from exc

    async def stream_chat(
        self,
        messages: list[AIMessage],
        config: ProviderConfig,
    ) -> AsyncGenerator[AIChunk, None]:
        """Stream a response from Ollama token by token."""
        base_url = (config.base_url or "http://localhost:11434").rstrip("/")
        url = f"{base_url}/api/chat"

        payload = {
            "model": config.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": True,
            "options": {
                "temperature": config.temperature,
                "num_predict": config.max_tokens,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
                async with client.stream("POST", url, json=payload) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line:
                            continue
                        import json
                        data = json.loads(line)
                        content = data.get("message", {}).get("content", "")
                        done = data.get("done", False)
                        if content:
                            yield AIChunk(content=content, is_final=done)

        except httpx.ConnectError as exc:
            raise AIProviderError(
                "ollama", f"Cannot connect to Ollama at {base_url}"
            ) from exc

    async def list_models(self, config: ProviderConfig) -> list[ModelInfo]:
        """List models available on the Ollama instance."""
        base_url = (config.base_url or "http://localhost:11434").rstrip("/")
        url = f"{base_url}/api/tags"

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()

                return [
                    ModelInfo(
                        name=m["name"],
                        provider=self.name,
                        size=m.get("size"),
                        description=m.get("details", {}).get("family"),
                    )
                    for m in data.get("models", [])
                ]

        except Exception as exc:
            logger.warning("Failed to list Ollama models: %s", exc)
            return []
