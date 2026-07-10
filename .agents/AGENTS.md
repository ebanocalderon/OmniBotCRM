# OmniBot — AI Customer Operations Platform

Enterprise SaaS platform combining AI, CRM, omnichannel messaging, workflow automation, and contact center capabilities.

## Stack

- **Backend**: Python 3.11 · FastAPI · SQLAlchemy async · PostgreSQL (pgvector) + Row-Level Security (RLS)
- **Frontend**: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Puck/GrapesJS (Page Builder)
- **Infra**: Docker Compose · Redis · Keycloak (auth/SSO)
- **Ingress/Proxy**: Caddy (for automated SSL / custom domains)
- **Background Jobs**: ARQ / Celery

## Commands

```bash
# Backend
pip install -e ".[dev]"                            # Install with dev deps
alembic revision --autogenerate -m "description"   # New migration
alembic upgrade head                               # Apply migrations

# Frontend
npm install                         # Install deps
npm run dev                         # Dev server
npm run build                       # Production build (validates TypeScript)
```

## Core Rules

1. **Research before coding.** List files, read existing patterns, identify config and env vars — then bullet your plan (what / why / what changes) before writing code.
2. **Match existing patterns.** Follow the style, structure, naming, and architecture already in the codebase. Don't invent new conventions.
3. **Tenant-scoped everything.** Every query, every endpoint, every piece of data must be scoped to `tenant_id`. Never leak data across tenants.
4. **Surface questions only for genuine ambiguity.** Challenge vague requirements internally, but only ask the user when the answer truly isn't inferrable from context.

## Conventions

- [Backend conventions](docs/backend-conventions.md)
- [Frontend conventions](docs/frontend-conventions.md)
- [Git workflow & PR standards](docs/git-workflow.md)
- [Guardrails & do-nots](docs/guardrails.md)
