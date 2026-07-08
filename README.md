# Chatwoot ↔ Telegram Bridge

A production-ready Python bridge that **bi-directionally** connects a self-hosted [Chatwoot](https://www.chatwoot.com/) instance to a Telegram bot.

```
Telegram User  ──►  Bridge Server (10.0.0.41:8000)  ──►  Chatwoot (agent sees message)
Chatwoot Agent ──►  Bridge Server (10.0.0.41:8000)  ──►  Telegram User (gets reply)
```

---

## Features

- ✅ Messages from Telegram → Chatwoot conversations (auto-creates contact + conversation)
- ✅ Agent replies from Chatwoot → Telegram user
- ✅ Persistent session mapping via SQLite (no duplicates across restarts)
- ✅ Optional HMAC-SHA256 webhook signature verification
- ✅ Handles text, photos, documents, voice, and stickers
- ✅ `/start`, `/help`, `/status` Telegram commands
- ✅ FastAPI interactive docs at `/docs`
- ✅ Health check endpoint at `/health`
- ✅ Runs as a systemd service on Ubuntu (auto-restart on crash / reboot)

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Python 3.11+ | |
| A running Chatwoot instance | Self-hosted or cloud |
| A Telegram Bot Token | From [@BotFather](https://t.me/BotFather) |
| Ubuntu server (10.0.0.41) | For production deployment |

---

## Quick Start — Ubuntu Server (10.0.0.41)

### 1. SSH into the server

```bash
ssh user@10.0.0.41
```

### 2. Clone the repository

```bash
git clone https://github.com/ebanocalderon/OmniBot.git
cd chatwoot-telegram-bridge
```

### 3. Run the automated deployment script

```bash
sudo bash deploy/deploy.sh
```

This will:
- Install system dependencies (git, python3, python3-venv)
- Create a dedicated `bridge` system user
- Clone/update the repo to `/opt/chatwoot-bridge`
- Create a Python virtual environment and install all packages
- Copy `.env.example` → `/opt/chatwoot-bridge/.env` (if not already present)
- Install and enable the `chatwoot-bridge` systemd service
- Start the service immediately

### 4. Edit the configuration

```bash
sudo nano /opt/chatwoot-bridge/.env
```

Fill in all the required values:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
CHATWOOT_BASE_URL=http://localhost:3000
CHATWOOT_API_TOKEN=your_api_token
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

### 5. Restart and verify

```bash
sudo systemctl restart chatwoot-bridge
curl http://10.0.0.41:8000/health
# Expected: {"status":"ok","telegram_polling":true}
```

### 6. Register the Chatwoot webhook

In Chatwoot: **Settings → Integrations → Webhooks → Add new webhook**

- URL: `http://10.0.0.41:8000/chatwoot/webhook`
- Enable: ✅ **Message Created**

---

## Manual Local Development Setup

### 1. Clone & create virtual environment

```bash
git clone https://github.com/ebanocalderon/OmniBot.git
cd chatwoot-telegram-bridge

python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env  # Linux/macOS
# copy .env.example .env  # Windows
```

Edit `.env` and fill in all values.

### 4. Run the server

```bash
python run.py
```

---

## Useful Service Commands

```bash
# Check status
sudo systemctl status chatwoot-bridge

# View live logs
sudo journalctl -u chatwoot-bridge -f

# View recent logs (last 100 lines)
sudo journalctl -u chatwoot-bridge -n 100 --no-pager

# Restart
sudo systemctl restart chatwoot-bridge

# Stop
sudo systemctl stop chatwoot-bridge

# Disable auto-start on boot
sudo systemctl disable chatwoot-bridge
```

---

## Updating the Service

After pushing a new version to GitHub, on the server run:

```bash
sudo bash /opt/chatwoot-bridge/deploy/deploy.sh
```

Or manually:

```bash
cd /opt/chatwoot-bridge
sudo git pull
sudo -u bridge venv/bin/pip install -r requirements.txt -q
sudo systemctl restart chatwoot-bridge
```

---

## Project Structure

```
chatwoot-telegram-bridge/
├── .env.example           # Config template (commit this, NOT .env)
├── .gitignore
├── requirements.txt
├── README.md
├── run.py                 # Entry point
│
├── deploy/
│   ├── chatwoot-bridge.service   # systemd unit file
│   └── deploy.sh                 # Ubuntu deployment script
│
└── app/
    ├── config.py          # pydantic-settings loader
    ├── database.py        # SQLite session store
    ├── main.py            # FastAPI app + lifespan
    │
    ├── chatwoot/
    │   ├── client.py      # Async Chatwoot REST API wrapper
    │   └── webhook.py     # POST /chatwoot/webhook handler
    │
    └── telegram/
        └── bot.py         # Bot handlers + polling runner
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | — | Bot token from @BotFather |
| `CHATWOOT_BASE_URL` | ✅ | — | Your Chatwoot URL |
| `CHATWOOT_API_TOKEN` | ✅ | — | Profile → Access Token |
| `CHATWOOT_ACCOUNT_ID` | ✅ | — | Numeric account ID |
| `CHATWOOT_INBOX_ID` | ✅ | — | API inbox numeric ID |
| `SERVER_HOST` | ❌ | `0.0.0.0` | Bind address |
| `SERVER_PORT` | ❌ | `8000` | Bind port |
| `WEBHOOK_SECRET` | ❌ | `` | HMAC secret for Chatwoot webhook |
| `DATABASE_PATH` | ❌ | `bridge.db` | SQLite file path |
| `LOG_LEVEL` | ❌ | `INFO` | DEBUG/INFO/WARNING/ERROR |

---

## Troubleshooting

**Bot doesn't respond in Telegram**
- Check that `TELEGRAM_BOT_TOKEN` is correct
- `sudo journalctl -u chatwoot-bridge -n 50 --no-pager`
- Make sure no other process is polling the same bot

**Chatwoot doesn't receive messages**
- Confirm `CHATWOOT_API_TOKEN`, `CHATWOOT_ACCOUNT_ID`, `CHATWOOT_INBOX_ID` are correct
- The inbox must be of type **API**
- Check `curl http://10.0.0.41:8000/health`

**Agent replies don't reach Telegram**
- Confirm the webhook URL `http://10.0.0.41:8000/chatwoot/webhook` is registered in Chatwoot
- Check that the reply is not a private note
- `sudo journalctl -u chatwoot-bridge -f` and watch for warnings

**Chatwoot blocks local IP (SSRF Block/Failed to send message)**
If you are running the bridge and Chatwoot on the same local network, Chatwoot will block outgoing webhooks to private IPs (e.g. `10.0.0.41`, `localhost`) by default, showing `Invalid webhook URL` or `Failed to send` in the UI. 

To fix this:
1. Open Chatwoot's `.env` file (e.g., `/root/.env` or `/home/chatwoot/chatwoot/.env`).
2. Add or set these configuration values:
   ```env
   ENABLE_SSRF_PREVENTION=false
   SAFE_FETCH_ALLOW_PRIVATE_NETWORK=true
   ```
3. Restart your Chatwoot service or Docker Compose stack (`docker compose down && docker compose up -d`).

**Service won't start**
- `sudo journalctl -u chatwoot-bridge -n 50 --no-pager`
- Verify `/opt/chatwoot-bridge/.env` has all required values
