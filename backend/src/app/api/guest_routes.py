"""Public guest and RSVP API endpoints."""

from fastapi import APIRouter, HTTPException

from src.core.models.event import Event
from src.core.models.guest import Guest, RsvpRequest
from src.services.guest_service import GuestService

router = APIRouter(prefix="/api/guests", tags=["guests"])

_guest_service: GuestService | None = None


def init_guest_routes(guest_service: GuestService) -> None:
    """Wire the guest service dependency into this router.

    Args:
        guest_service: The service instance to use for guest operations.
    """
    global _guest_service  # noqa: PLW0603
    _guest_service = guest_service


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
        HTTPException: 404 if no guest matches the token.
    """
    service = _get_guest_service()
    try:
        return await service.submit_rsvp_async(token, rsvp_request)
    except ValueError:
        raise HTTPException(status_code=404, detail="Guest not found")


event_router = APIRouter(tags=["event"])


@event_router.get("/api/event", response_model=Event)
async def get_event_details_async() -> Event:
    """Return the static event information.

    Returns:
        The event details model with all venue and schedule info.
    """
    return Event()
