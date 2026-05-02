# Christening RSVP

A full-stack web app for managing guest RSVPs for a christening event. Guests receive a unique token-based URL to submit their RSVP, no account required. A separate admin dashboard provides guest management and response tracking.

## Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.12, FastAPI, Pydantic, uvicorn |
| Frontend (public) | React 19, TypeScript, Vite, React Router, Axios |
| Frontend (admin) | React 19, TypeScript, Vite, Axios |
| Storage | JSON file (no database required) |
| Deployment | Docker + Docker Compose, host-level nginx + Let's Encrypt |

## Project Structure

```
christening-rsvp/
├── .env                       # Single source of truth for all services
├── docker-compose.yml         # Dev stack
├── docker-compose.prod.yml    # Prod stack (binds to 127.0.0.1 only)
├── backend/                   # FastAPI service
│   ├── Dockerfile
│   └── src/app, core, services, infrastructure
├── frontend/                  # Public RSVP site (port 5173)
│   ├── Dockerfile             # Multi-stage: dev / prod
│   └── nginx.conf             # Container nginx for prod build
├── admin-frontend/            # Admin dashboard (port 5174)
│   ├── Dockerfile             # Multi-stage: dev / prod
│   └── nginx.conf
└── nginx-host/                # Host-level nginx + certbot
    ├── danya.conf.template    # Rendered into /etc/nginx/sites-available
    └── setup.sh               # Run on the VM to install nginx + certs
```

## Local Development

### Option 1 — Docker (recommended)

```bash
# Copy env template and edit
cp .env.example .env

# Boot the full stack with HMR
docker compose up --build

# Visit:
#   http://localhost:5173    — public RSVP site
#   http://localhost:5174    — admin dashboard
#   http://localhost:8000    — backend API
#   http://localhost:8000/docs — Swagger UI
```

### Option 2 — Native

```bash
# Backend
cd backend
pip install -r requirements.txt
make dev                       # http://localhost:8000

# Public frontend (new terminal)
cd frontend
npm install
npm run dev                    # http://localhost:5173

# Admin frontend (new terminal)
cd admin-frontend
npm install
npm run dev                    # http://localhost:5174
```

## Environment Variables

All services read from the **single repo-root `.env`**. Frontends use `envDir: '..'` in their Vite config; the backend's pydantic-settings points at the root `.env`; docker-compose injects the same file via `env_file: .env`.

| Variable | Used by | Description |
|---|---|---|
| `APP_HOST`, `APP_PORT` | backend | uvicorn bind |
| `DATA_DIR` | backend | Where guest JSON is persisted |
| `CORS_ORIGINS` | backend | Comma-separated allowed origins |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | backend | HTTP Basic creds for `/api/admin/*` |
| `VITE_BACKEND_URL` | both frontends (build time) | Absolute backend URL. Empty → use Vite proxy `/api` |
| `VITE_GUEST_PUBLIC_URL` | admin-frontend (build time) | Public domain to embed in copied RSVP links |
| `GUEST_URL`, `ADMIN_URL`, `BASE_URL` | nginx-host/setup.sh | Drives the nginx template + Let's Encrypt cert request |
| `CERTBOT_EMAIL` | nginx-host/setup.sh | Email tied to the Let's Encrypt account |

## Production Deployment

The deploy assumes a Linux VM with public DNS pointing three A-records at it:

| Host | Purpose |
|---|---|
| `danyarsvp.pnonat.com` | Public RSVP site (guests) |
| `danyainternal.pnonat.com` | Admin dashboard |
| `danyabackend.pnonat.com` | FastAPI |

On the VM, after cloning the repo and creating `.env`:

```bash
# 1. Install host nginx + obtain Let's Encrypt certs for all three domains
sudo ./nginx-host/setup.sh

# 2. Build & boot the prod stack (binds to 127.0.0.1 only — host nginx
#    is the only public surface)
docker compose -f docker-compose.prod.yml up -d --build
```

`setup.sh` is **idempotent**: re-running it re-renders the nginx config from `danya.conf.template` and only requests certs for hosts that don't already have one.

### Architecture

```
                  ┌──────────────┐
   Internet ─────▶│  host nginx  │ (ports 80/443, Let's Encrypt SSL)
                  └──────┬───────┘
                         │ proxies by Host header
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
  127.0.0.1:5173   127.0.0.1:5174   127.0.0.1:8000
   frontend         admin-frontend     backend
   (nginx:alpine    (nginx:alpine      (uvicorn,
    serving Vite     serving Vite       2 workers)
    build)           build)
```

## API Endpoints

### Guest (public)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/event` | Get event details |
| `GET` | `/api/guests/{token}` | Look up guest by RSVP token |
| `POST` | `/api/guests/{token}/rsvp` | Submit RSVP response |
| `GET` | `/api/rsvp-window` | Public RSVP window status |

### Admin (HTTP Basic auth required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/guests` | List all guests |
| `POST` | `/api/admin/guests` | Create a guest |
| `PUT` | `/api/admin/guests/{id}` | Update a guest |
| `DELETE` | `/api/admin/guests/{id}` | Delete a guest |
| `GET` | `/api/admin/stats` | RSVP statistics |
| `GET` | `/api/admin/rsvp-window` | Get RSVP open/close window |
| `PUT` | `/api/admin/rsvp-window` | Set RSVP open/close window |

Full interactive docs available at `${BASE_URL}/docs`.

## How It Works

1. Admin signs in to the admin dashboard and adds guests. Each guest gets a unique RSVP token.
2. Admin copies the token URL (`${GUEST_URL}/rsvp/<token>`) and shares it with the guest.
3. Guest opens their URL, scrolls open the envelope, reviews event details, and submits their RSVP.
4. Admin monitors responses in real time on the dashboard.
