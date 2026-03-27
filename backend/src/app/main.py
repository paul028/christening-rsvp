"""FastAPI application entry point."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.config import AppSettings
from src.app.api.guest_routes import router as guest_router, event_router, rsvp_window_router, init_guest_routes
from src.app.api.admin_routes import router as admin_router, init_admin_routes
from src.infrastructure.json_guest_repository import JsonGuestRepository
from src.infrastructure.json_settings_repository import JsonSettingsRepository
from src.services.guest_service import GuestService
from src.services.settings_service import SettingsService
from src.services.token_service import TokenService


def _create_app() -> FastAPI:
    """Build and configure the FastAPI application.

    Wires up middleware, repositories, services, and route handlers.

    Returns:
        A fully configured FastAPI instance.
    """
    settings = AppSettings()

    app = FastAPI(
        title="Christening RSVP API",
        description="Backend API for managing christening event RSVPs",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Infrastructure
    data_path = Path(settings.DATA_DIR) / "guests.json"
    settings_path = Path(settings.DATA_DIR) / "settings.json"
    guest_repository = JsonGuestRepository(file_path=data_path)
    settings_repository = JsonSettingsRepository(file_path=settings_path)

    # Services
    token_service = TokenService()
    guest_service = GuestService(
        guest_repository=guest_repository,
        token_service=token_service,
    )
    settings_service = SettingsService(settings_repository=settings_repository)

    # Inject services into route modules
    init_guest_routes(guest_service, settings_service)
    init_admin_routes(guest_service, settings_service)

    # Register routers
    app.include_router(guest_router)
    app.include_router(event_router)
    app.include_router(rsvp_window_router)
    app.include_router(admin_router)

    @app.get("/health")
    async def health_check_async() -> dict[str, str]:
        """Return a simple health status.

        Returns:
            A dict with status "ok".
        """
        return {"status": "ok"}

    return app


app = _create_app()
