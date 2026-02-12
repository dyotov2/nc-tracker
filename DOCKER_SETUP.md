# NC Tracker - Docker Setup

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running

That's it. No Node.js or other dependencies needed.

## Quick Start

```bash
git clone https://github.com/dyotov2/nc-tracker.git
cd nc-tracker
chmod +x setup.sh
./setup.sh
```

The script will build both containers and start the app. Once finished:

- **App**: http://localhost:3000
- **API**: http://localhost:5000/api

## Manual Setup

If you prefer to run the commands yourself:

```bash
# 1. Clone the repo
git clone https://github.com/dyotov2/nc-tracker.git
cd nc-tracker

# 2. (Optional) Set up email notifications
cp backend/.env.example backend/.env
# Edit backend/.env with your SMTP settings

# 3. Build and start
docker compose up -d --build

# 4. Open http://localhost:3000
```

## Common Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start the app |
| `docker compose down` | Stop the app |
| `docker compose logs -f` | View live logs |
| `docker compose up -d --build` | Rebuild after code changes |
| `docker compose ps` | Check container status |

## Email Notifications (Optional)

Email is **not required** — the app works fully without it. To enable notifications:

1. Edit `backend/.env` with your SMTP settings
2. Restart: `docker compose down && docker compose up -d`

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for provider-specific instructions (Gmail, Outlook, etc.).

## Data & Backups

The SQLite database persists between restarts. To back up your data:

```bash
docker cp nc-tracker-backend-1:/app/ncs.db ./backup-ncs.db
```

To restore:

```bash
docker cp ./backup-ncs.db nc-tracker-backend-1:/app/ncs.db
docker compose restart backend
```

To reset the database completely, delete `backend/ncs.db` and restart.

## Troubleshooting

**Port conflict (3000 or 5000 already in use)**

Edit `docker-compose.yml` and change the left side of the port mapping:

```yaml
ports:
  - "3001:80"   # frontend — change 3001 to any free port
  - "5001:5000" # backend  — change 5001 to any free port
```

**Containers won't start**

```bash
docker compose logs        # check for errors
docker compose down -v     # full reset
docker compose up --build  # rebuild from scratch
```
