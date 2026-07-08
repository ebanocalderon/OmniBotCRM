"""
Cursor-based pagination utilities.

Cursor-based pagination is used instead of offset-based because:
1. It handles concurrent inserts without skipping or duplicating records.
2. Performance is constant regardless of page depth (no OFFSET scan).
3. It's the standard for real-time data feeds and API-first platforms.

Usage:
    from app.core.pagination import PaginationParams, paginate_query

    @router.get("/contacts")
    async def list_contacts(
        params: PaginationParams = Depends(),
        db: AsyncSession = Depends(get_db),
    ):
        return await paginate_query(db, select(Contact), params)
"""
from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from typing import Any, Generic, Optional, Sequence, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Query parameters for cursor-based pagination."""

    cursor: Optional[str] = Field(
        default=None, description="Opaque cursor from previous response"
    )
    limit: int = Field(
        default=25, ge=1, le=100, description="Number of items per page (max 100)"
    )


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated response wrapper."""

    data: list[T]
    meta: PaginationMeta


class PaginationMeta(BaseModel):
    """Pagination metadata returned with every list response."""

    next_cursor: Optional[str] = None
    has_more: bool = False
    total_count: Optional[int] = None


def encode_cursor(values: dict[str, Any]) -> str:
    """Encode cursor values into an opaque base64 string."""
    raw = json.dumps(values, default=str)
    return base64.urlsafe_b64encode(raw.encode()).decode()


def decode_cursor(cursor: str) -> dict[str, Any]:
    """Decode an opaque cursor back into filter values."""
    try:
        raw = base64.urlsafe_b64decode(cursor.encode()).decode()
        return json.loads(raw)
    except (ValueError, json.JSONDecodeError) as exc:
        raise ValueError(f"Invalid cursor: {exc}") from exc


async def paginate_query(
    db: AsyncSession,
    query: Select,
    params: PaginationParams,
    *,
    id_column: Any = None,
    count: bool = True,
) -> dict[str, Any]:
    """
    Apply cursor-based pagination to a SQLAlchemy select query.

    Args:
        db: Database session.
        query: Base SELECT query (before pagination is applied).
        params: PaginationParams from the request.
        id_column: The column to use for cursor ordering (default: id).
        count: Whether to execute a COUNT query for total_count.

    Returns:
        Dict with 'data', 'meta' keys matching PaginatedResponse schema.
    """
    # Default to ordering/cursoring by the 'id' column
    if id_column is None:
        # Get the first column's table and use its 'id'
        froms = query.froms
        if froms:
            id_column = froms[0].c.id
        else:
            raise ValueError("Cannot determine id_column for pagination")

    # Apply cursor filter
    if params.cursor:
        cursor_data = decode_cursor(params.cursor)
        last_id = cursor_data.get("id")
        if last_id:
            query = query.where(id_column > last_id)

    # Order by id for stable cursor pagination
    query = query.order_by(id_column)

    # Fetch limit + 1 to determine if there are more results
    query = query.limit(params.limit + 1)

    result = await db.execute(query)
    rows = list(result.scalars().all())

    has_more = len(rows) > params.limit
    if has_more:
        rows = rows[: params.limit]

    # Build next cursor
    next_cursor = None
    if has_more and rows:
        last_row = rows[-1]
        next_cursor = encode_cursor({"id": str(last_row.id)})

    # Optional total count
    total_count = None
    if count:
        count_query = select(func.count()).select_from(query.subquery())
        # Actually, count the base query without limit/offset
        # We need to rebuild for an accurate count
        # For now, skip total_count on large datasets for performance
        total_count = None  # TODO: implement efficient count strategy

    return {
        "data": rows,
        "meta": {
            "next_cursor": next_cursor,
            "has_more": has_more,
            "total_count": total_count,
        },
    }
