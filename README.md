# Christening RSVP

A full-stack web app for managing guest RSVPs for a christening event. Guests receive a unique token-based URL to submit their RSVP — no account required. An admin dashboard provides guest management and response tracking.

## Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.10+, FastAPI, Pydantic, uvicorn |
| Frontend | React 19, TypeScript, Vite, React Router, Axios |
| Storage | JSON file (no database required) |

## Project Structure

```
christening-rsvp/
├── backend/
│   ├── src/
│   │   ├── app/           # FastAPI entry point, config, routes
│   │   ├── core/          # Domain models and repository interface
│   │   ├── services/      # Guest and token business logic
│   │   └── infrastructure/# JSON file repository implementation
│   └── tests/             # Unit tests (pytest)
└── frontend/
    └── src/
        ├── pages/         # RsvpPage, AdminPage, NotFoundPage
        ├── components/    # Header, EventDetails, RsvpForm, etc.
        └── api/           # Axios API client
```

## Getting Started

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.template .env
# Edit .env as needed

# Run dev server (http://localhost:8000)
make dev

# Run tests
make test

# Lint
make lint
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (required for LAN access)
cp .env.example .env
# Edit VITE_PUBLIC_URL to match your machine's LAN IP

# Run dev server (http://localhost:5173 + network URL)
npm run dev

# Build for production
npm run build
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `APP_HOST` | `0.0.0.0` | Server bind address |
| `APP_PORT` | `8000` | Server port |
| `DATA_DIR` | `./data` | Path for JSON guest data file |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed frontend origins |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_PUBLIC_URL` | *(unset — falls back to `window.location.origin`)* | Public base URL used when copying guest RSVP links in the admin dashboard. Set this to your LAN IP (e.g. `http://192.168.1.x:5173`) so copied links work on other devices. |

> **LAN access**: Vite binds to all interfaces by default (`host: true`). Set `VITE_PUBLIC_URL` to your machine's LAN IP so the admin "Copy URL" button generates links that guests can open from their phones on the same network.

## API Endpoints

### Guest (public)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/event` | Get event details |
| `GET` | `/api/guests/{token}` | Look up guest by RSVP token |
| `POST` | `/api/guests/{token}/rsvp` | Submit RSVP response |

### Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/guests` | List all guests |
| `POST` | `/api/admin/guests` | Create a guest |
| `PUT` | `/api/admin/guests/{id}` | Update a guest |
| `DELETE` | `/api/admin/guests/{id}` | Delete a guest |
| `GET` | `/api/admin/stats` | RSVP statistics |

Full interactive docs available at `http://localhost:8000/docs`.

## How It Works

1. Admin adds guests via the dashboard — each guest gets a unique RSVP token.
2. Admin copies and shares the token URL (`/rsvp/<token>`) with each guest.
3. Guest visits their URL, sees event details, and submits their RSVP.
4. Admin monitors responses in real time on the dashboard.
