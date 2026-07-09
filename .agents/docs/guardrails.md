# Guardrails & Do-Nots

## Hard Rules

- **No translation key changes** unless explicitly specified in the task.
- **No unnecessary logic** — if it doesn't serve the task, don't add it.
- **No blanket try-catch** — handle specific exceptions with intention.
- **No side effects without disclosure** — if your change affects another module, call it out.
- **No files over ~300 lines** — if a file is growing beyond control, split it and flag it.

## Architecture Constraints

- Every database query must filter by `tenant_id`. No exceptions.
- New routers must be registered in `app/main.py` under the `api_router` prefix.
- New frontend routes must have the Sidebar updated if they're a primary navigation item.
- Auth middleware protects all `/api/v1/*` routes except `/api/v1/auth/*`.
