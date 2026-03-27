"""Public guest and RSVP API endpoints."""

from fastapi import APIRouter, HTTPException

from src.core.models.event import Event
from src.core.models.guest import Guest, RsvpRequest
from src.core.models.rsvp_window import RsvpWindowStatus
from src.services.guest_service import GuestService
from src.services.settings_service import SettingsService

router = APIRouter(prefix="/api/guests", tags=["guests"])
rsvp_window_router = APIRouter(tags=["rsvp-window"])

_guest_service: GuestService | None = None
_settings_service: SettingsService | None = None


def init_guest_routes(guest_service: GuestService, settings_service: SettingsService) -> None:
    """Wire service dependencies into this router.

    Args:
        guest_service: The service instance to use for guest operations.
        settings_service: The service instance to use for RSVP window checks.
    """
    global _guest_service, _settings_service  # noqa: PLW0603
    _guest_service = guest_service
    _settings_service = settings_service


def _get_guest_service() -> GuestService:
    """Return the configured guest service or raise if not initialised.

    Returns:
        The active GuestService instance.

    Raises:
        RuntimeError: If the service has not been initialised.
    """
    if _guest_service is None:
        raise RuntimeError("GuestService not initialised")
    return _guest_service


def _get_settings_service() -> SettingsService:
    if _settings_service is None:
        raise RuntimeError("SettingsService not initialised")
    return _settings_service


@router.get("/{token}", response_model=Guest)
async def get_guest_by_token_async(token: str) -> Guest:
    """Retrieve a guest by their RSVP token.

    Args:
        token: The unique URL token for the guest.

    Returns:
        The matching guest record.

    Raises:
        HTTPException: 404 if no guest matches the token.
    """
    service = _get_guest_service()
    guest = await service.get_guest_by_token_async(token)
    if guest is None:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest


@router.post("/{token}/rsvp", response_model=Guest)
async def submit_rsvp_async(token: str, rsvp_request: RsvpRequest) -> Guest:
    """Submit an RSVP response for a guest.

    Args:
        token: The unique URL token for the guest.
        rsvp_request: The RSVP submission payload.

    Returns:
        The updated guest record.

    Raises:
        HTTPException: 403 if the RSVP window is closed.
        HTTPException: 404 if no guest matches the token.
    """
    if not await _get_settings_service().is_rsvp_open_async():
        raise HTTPException(status_code=403, detail="RSVP window is closed")
    service = _get_guest_service()
    try:
        return await service.submit_rsvp_async(token, rsvp_request)
    except ValueError:
        raise HTTPException(status_code=404, detail="Guest not found")


@rsvp_window_router.get("/api/rsvp-window", response_model=RsvpWindowStatus)
async def get_rsvp_window_status_async() -> RsvpWindowStatus:
    """Return the current RSVP window and its open/closed state.

    Returns:
        The RSVP window configuration with a computed is_open flag.
    """
    return await _get_settings_service().get_rsvp_window_status_async()


event_router = APIRouter(tags=["event"])


@event_router.get("/api/event", response_model=Event)
async def get_event_details_async() -> Event:
    """Return the static event information.

    Returns:
        The event details model with all venue and schedule info.
    """
    return Event()
