"""
Internal event bus for the modular monolith.

Provides a simple publish/subscribe system for domain events.
Services publish events, and other services subscribe to them.
All communication stays in-process (no external message broker needed).

In Phase 4+, this can be swapped for Redis Streams or RabbitMQ by
changing the EventBus implementation without modifying publishers
or subscribers.
"""
from __future__ import annotations

import asyncio
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Coroutine
from uuid import UUID, uuid4

logger = logging.getLogger(__name__)

# Type alias for event handler functions
EventHandler = Callable[["DomainEvent"], Coroutine[Any, Any, None]]


@dataclass(frozen=True)
class DomainEvent:
    """
    Base class for all domain events.

    Attributes:
        event_id: Unique identifier for this event instance.
        event_type: Dot-notation event type (e.g. 'message.received').
        tenant_id: Tenant this event belongs to (multi-tenancy enforcement).
        timestamp: When the event occurred.
        payload: Event-specific data.
        correlation_id: Groups related events across a workflow.
        causation_id: The event_id of the event that caused this one.
    """

    event_type: str
    tenant_id: UUID
    payload: dict[str, Any]
    event_id: UUID = field(default_factory=uuid4)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    correlation_id: UUID | None = None
    causation_id: UUID | None = None


class EventBus:
    """
    In-process async event bus.

    Subscribers register handlers for specific event types.
    When an event is published, all matching handlers are invoked.
    Handlers run concurrently via asyncio.gather for performance.
    Exceptions in individual handlers are logged but don't propagate —
    a failing subscriber must not break the publisher.
    """

    def __init__(self) -> None:
        self._handlers: dict[str, list[EventHandler]] = defaultdict(list)
        self._global_handlers: list[EventHandler] = []

    def subscribe(self, event_type: str, handler: EventHandler) -> None:
        """Register a handler for a specific event type."""
        self._handlers[event_type].append(handler)
        logger.debug("Subscribed %s to event '%s'", handler.__qualname__, event_type)

    def subscribe_all(self, handler: EventHandler) -> None:
        """Register a handler that receives ALL events (e.g. audit logging)."""
        self._global_handlers.append(handler)
        logger.debug("Subscribed %s to ALL events", handler.__qualname__)

    async def publish(self, event: DomainEvent) -> None:
        """
        Publish an event to all matching subscribers.

        Handlers for the specific event_type AND global handlers are invoked.
        All handlers run concurrently. Individual failures are logged
        but do not affect other handlers or the publisher.
        """
        handlers = self._handlers.get(event.event_type, []) + self._global_handlers

        if not handlers:
            logger.debug("No handlers for event '%s'", event.event_type)
            return

        logger.info(
            "Publishing event '%s' (id=%s, tenant=%s) to %d handler(s)",
            event.event_type,
            event.event_id,
            event.tenant_id,
            len(handlers),
        )

        tasks = [self._safe_invoke(handler, event) for handler in handlers]
        await asyncio.gather(*tasks)

    @staticmethod
    async def _safe_invoke(handler: EventHandler, event: DomainEvent) -> None:
        """Invoke a handler, catching and logging any exceptions."""
        try:
            await handler(event)
        except Exception:
            logger.exception(
                "Handler %s failed for event '%s' (id=%s)",
                handler.__qualname__,
                event.event_type,
                event.event_id,
            )


# ── Module-level singleton ───────────────────────────────────────────────────
# All domain modules import and use this shared instance.
event_bus = EventBus()
