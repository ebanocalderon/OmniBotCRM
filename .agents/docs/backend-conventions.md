# Backend Conventions (Python / FastAPI)

## Module Structure

Each domain module follows this layout:

```
app/<module>/
├── __init__.py
├── models.py      # SQLAlchemy ORM models
├── schemas.py     # Pydantic request/response schemas
├── service.py     # Business logic (no HTTP concerns)
├── router.py      # FastAPI route handlers
└── exceptions.py  # Domain-specific exceptions (if needed)
```

## Patterns

- All models inherit from `app.core.database.Base` (includes `id`, `created_at`, `updated_at`).
- Use `mapped_column` with type annotations (SQLAlchemy 2.0 style).
- Settings via `app.core.config.get_settings()` singleton — never read env vars directly.
- Async everywhere: `AsyncSession`, `async def`, `await`.
- Service layer receives `db: AsyncSession` and `tenant_id: UUID` — routers handle DI via `Depends()`.
- Add docstrings to all public methods. Add inline comments only for non-obvious intent.
- New routers must be registered in `app/main.py` under the `api_router` prefix.
- Auth middleware protects all `/api/v1/*` routes except `/api/v1/auth/*`.
