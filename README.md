# OmniBot — AI Customer Operations Platform

An open-source, enterprise-ready platform that combines **AI**, **CRM**, **omnichannel communications**, **workflow automation**, and **cloud contact center** capabilities into a unified system.

Build to automate and optimize the entire customer operations lifecycle — from first contact to resolution — across every channel, with AI handling repetitive work and assisting human agents.

---

## Architecture

```
                    ┌─────────────────────┐
                    │   Platform UI        │
                    │   (Next.js :3001)    │
                    └──────┬──────────────┘
                           │ HTTP
                    ┌──────▼──────────────┐
                    │   Platform API       │
                    │  (FastAPI :8000)     │
                    └──┬────┬────┬────┬───┘
                       │    │    │    │
            ┌──────────┘    │    │    └──────────┐
            ▼                ▼    ▼                ▼
     ┌──────────┐    ┌──────────┐    ┌──────────────────┐
     │PostgreSQL│    │   Redis  │    │    Keycloak      │
     │(pgvector)│    │  (Cache) │    │    (Auth / SSO)  │
     └──────────┘    └──────────┘    └──────────────────┘
```

**AI Layer** — Ollama (local), OpenAI, Anthropic — with configurable provider routing and loop-safe auto-responders.

**Messaging Layer** — Native Telegram channel integration, webhook ingestion, and extensible channel drivers for omnichannel routing.

**CRM Layer** — Contact management, conversation history, account/tenant isolation, and full CRUD over API.

**Automation Layer** — Rule-based triggers and actions, workflow engine, scheduled jobs.

---

## Services

| Service | Stack | Port |
|---|---|---|
| **Platform API** | Python FastAPI + SQLAlchemy async + pgvector | `8000` |
| **Platform UI** | Next.js 14 (App Router) + TypeScript + Tailwind | `3001` |
| **PostgreSQL** | pgvector/pg16 (vector embeddings) | `5432` |
| **Redis** | Redis 7 Alpine (caching, queues) | `6379` |
| **Keycloak** | Auth / SSO / RBAC | `8080` |

---

## Quick Start

```bash
# Clone
git clone https://github.com/ebanocalderon/OmniBot.git
cd chatwoot

# Copy environment config
cp .env.example .env

# Start the full stack
docker compose up -d

# Apply database migrations
docker compose exec api alembic upgrade head
```

**Access the platform:**
- Platform UI: [http://localhost:3001](http://localhost:3001)
- API Docs: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- Keycloak Admin: [http://localhost:8080](http://localhost:8080)

---

## Project Structure

```
chatwoot/
├── docker-compose.yml          # Full dev stack orchestration
├── .env.example                # Environment variables template
│
├── backend/                    # Platform API (FastAPI)
│   ├── app/
│   │   ├── ai/                 # AI provider routing, auto-responders
│   │   ├── analytics/          # Usage metrics, reporting
│   │   ├── auth/               # Keycloak OAuth, session management
│   │   ├── automations/        # Rule engine, triggers, actions
│   │   ├── core/               # Database, config, security, models
│   │   ├── crm/                # Contacts, conversations, accounts
│   │   ├── messaging/          # Telegram channels, webhooks, drivers
│   │   └── tenants/            # Multi-tenant isolation
│   ├── migrations/             # Alembic DB migrations
│   └── pyproject.toml
│
├── platform-ui/                # Platform UI (Next.js 14)
│   └── src/
│       └── app/
│           ├── dashboard/      # Analytics & KPIs
│           ├── conversations/  # Omnichannel inbox
│           ├── contacts/       # Contact management
│           ├── automations/    # Workflow builder
│           ├── settings/       # Channel & org configuration
│           └── login/          # Auth flows
│
├── AGENTS.md                   # Development conventions
└── README.md
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection (asyncpg) |
| `REDIS_URL` | ✅ | — | Redis connection |
| `KEYCLOAK_SERVER_URL` | ✅ | — | Keycloak base URL |
| `KEYCLOAK_REALM` | ✅ | `omnibot` | Keycloak realm |
| `KEYCLOAK_CLIENT_ID` | ✅ | `omnibot-api` | Keycloak client |
| `SECRET_KEY` | ✅ | — | Session & JWT signing |
| `CHATWOOT_BASE_URL` | ❌ | — | Chatwoot instance URL |
| `CHATWOOT_API_TOKEN` | ❌ | — | Chatwoot access token |
| `TELEGRAM_BOT_TOKEN` | ❌ | — | Telegram bot token |
| `OLLAMA_BASE_URL` | ❌ | `http://localhost:11434` | Local AI endpoint |
| `OPENAI_API_KEY` | ❌ | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | ❌ | — | Anthropic API key |

---

## Development

```bash
# Backend (standalone)
cd backend
python -m venv venv; venv\Scripts\activate  # Windows
# source venv/bin/activate                  # macOS/Linux
pip install -e .
uvicorn app.main:app --reload --port 8000

# Frontend (standalone)
cd platform-ui
npm install
npm run dev
```

---

## Deployment

The platform runs as a Docker Compose stack on any Linux server with Docker installed.

```bash
docker compose up -d --build
```

For production, configure reverse proxy (nginx/Caddy) with TLS in front of the UI and API services.
