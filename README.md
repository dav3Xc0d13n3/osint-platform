# OSINT Platform — Render Deployment Ready

Unified reconnaissance engine: username enumeration, reverse image search, link analysis.

## Quick Deploy to Render

### Option 1: Blueprint (Recommended)
1. Fork this repo
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your forked repo
5. Render will auto-detect `render.yaml` and create all services

### Option 2: Manual Services
Create these services in Render:

**1. PostgreSQL Database**
- Name: `osint-db`
- Database: `osint`
- User: `osint`
- Plan: Free

**2. Redis**
- Name: `osint-redis`
- Plan: Free
- Maxmemory Policy: `allkeys-lru`

**3. Backend Web Service**
- Name: `osint-backend`
- Runtime: Python 3.12
- Build Command: `pip install -r requirements.txt && alembic upgrade head`
- Start Command: `gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 300`
- Environment Variables (auto-linked from DB/Redis):
  - `DATABASE_URL` → from `osint-db`
  - `REDIS_URL` → from `osint-redis`
  - `SECRET_KEY` → generate
  - `DEBUG` → `false`
  - `CORS_ORIGINS` → `https://osint-frontend.onrender.com`

**4. Celery Worker**
- Name: `osint-worker`
- Runtime: Python 3.12
- Build Command: `pip install -r requirements.txt`
- Start Command: `celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4`
- Same env vars as backend

**5. Celery Beat**
- Name: `osint-beat`
- Runtime: Python 3.12
- Build Command: `pip install -r requirements.txt`
- Start Command: `celery -A app.tasks.celery_app beat --loglevel=info`
- Same env vars as backend

**6. Frontend Static Site**
- Name: `osint-frontend`
- Build Command: `cd frontend && npm ci && npm run build`
- Publish Path: `frontend/dist`
- Environment Variable:
  - `VITE_API_URL` → `https://osint-backend.onrender.com/api/v1`

## Local Development

```bash
# With Docker
docker-compose up -d --build

# Backend only (requires PostgreSQL + Redis locally)
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend only
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/username/enumerate` | Username across 300+ platforms |
| POST | `/api/v1/image/search` | Reverse image (file/URL) |
| POST | `/api/v1/link/analyze` | URL analysis (redirects, metadata, SSL, threats) |
| GET | `/api/v1/jobs/{id}` | Poll job results |
| POST | `/api/v1/keys` | Create API keys |

## Features (Zero External Keys Required)

- **Username**: 300+ platforms via direct HTTP
- **Image**: EXIF, perceptual hashing, face embeddings (local)
- **Link**: Redirect chains, OG/Twitter/JSON-LD metadata, SSL certs, Wayback, crt.sh subdomains

## Optional Enhancements (Add Keys in Render Dashboard)

| Service | Purpose |
|---------|---------|
| Google CSE | Image search results |
| Yandex | Image search |
| TinEye | Reverse image |
| Bing Visual | Image search |
| VirusTotal | URL threat intel |
| URLhaus | Malware URLs |
| AlienVault OTX | Threat pulses |

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│ PostgreSQL  │
│  (Static)   │     │  (FastAPI)  │     │  (Async)    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │    Redis    │
                    │  (Cache +   │
                    │   Celery)   │
                    └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌─────────┐ ┌──────────┐ ┌──────────┐
         │Username │ │  Image   │ │  Link    │
         │ Service │ │ Service  │ │ Service  │
         └─────────┘ └──────────┘ └──────────┘
```

## License

MIT — @oll.fx and killywilly