# Change History

## 2026-03-27 — Initial Project Scaffold

1. Created FastAPI backend with SOLID architecture:
   - Core models (Guest, Event, RsvpStatus)
   - GuestRepository interface (ABC)
   - JsonGuestRepository implementation (file-based)
   - GuestService and TokenService
   - Guest API routes (RSVP by token, event details)
   - Admin API routes (CRUD guests, stats)
   - 15 unit tests — all passing

2. Created React + TypeScript frontend (Vite):
   - RsvpPage with event details, photo gallery, RSVP form, directions, FAQ
   - AdminPage with stats dashboard, guest management, RSVP URL generation
   - Christening-themed pastel design
   - Responsive, mobile-first layout

### Key Files

**Backend:**
- `backend/src/app/main.py` — FastAPI entry point
- `backend/src/app/api/guest_routes.py` — Guest/RSVP endpoints
- `backend/src/app/api/admin_routes.py` — Admin endpoints
- `backend/src/core/models/guest.py` — Guest model
- `backend/src/services/guest_service.py` — Business logic
- `backend/src/infrastructure/json_guest_repository.py` — Storage

**Frontend:**
- `frontend/src/App.tsx` — Router setup
- `frontend/src/pages/RsvpPage.tsx` — Main RSVP page
- `frontend/src/pages/AdminPage.tsx` — Admin dashboard
- `frontend/src/api/client.ts` — API client
- `frontend/src/App.css` — Christening theme styles
