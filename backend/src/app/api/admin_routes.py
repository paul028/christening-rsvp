"""Admin API endpoints for guest management."""

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException

from src.app.auth import require_admin
from src.core.models.guest import Guest, RsvpStatus
from src.core.models.rsvp_window import RsvpWindow, RsvpWindowStatus
from src.services.guest_service import GuestService
from src.services.settings_service import SettingsService

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)

_guest_service: GuestService | None = None
_settings_service: SettingsService | None = None


def init_admin_routes(guest_service: GuestService, settings_service: SettingsService) -> None:
    """Wire service dependencies into this router.

    Args:
        guest_service: The service instance to use for admin operations.
        settings_service: The service instance for RSVP window management.
    """
    global _guest_service, _settings_service  # noqa: PLW0603
    _guest_service = guest_service
    _settings_service = settings_service


def _get_guest_service() -> GuestService:
    if _guest_service is None:
        raise RuntimeError("GuestService not initialised")
    return _guest_service


def _get_settings_service() -> SettingsService:
    if _settings_service is None:
        raise RuntimeError("SettingsService not initialised")
    return _settings_service


class CreateGuestRequest(BaseModel):
    """Payload for creating a new guest.

    Attributes:
        name: Full name of the guest.
        email: Optional email address.
        phone: Optional phone number.
        max_companions: Maximum number of companions this guest may bring.
        sponsor_role: "ninong", "ninang", or None.
    """

    name: str
    email: str | None = None
    phone: str | None = None
    max_companions: int = 0
    sponsor_role: str | None = None  # "ninong" | "ninang" | None


class UpdateGuestRequest(BaseModel):
    """Payload for updating guest information.

    Attributes:
        name: Updated full name.
        email: Updated email address.
        phone: Updated phone number.
        max_companions: Maximum number of companions this guest may bring.
        sponsor_role: "ninong", "ninang", or None.
    """

    name: str
    email: str | None = None
    phone: str | None = None
    max_companions: int = 0
    sponsor_role: str | None = None


class RsvpStats(BaseModel):
    """Aggregate RSVP statistics.

    Attributes:
        total: Total number of invited guests.
        attending: Number of guests who confirmed attendance.
        not_attending: Number of guests who declined.
        pending: Number of guests who have not yet responded.
        total_companions: Total companions across all attending guests.
        attending_headcount: Attending guests plus their companions.
    """

    total: int
    attending: int
    not_attending: int
    pending: int
    total_companions: int
    attending_headcount: int


@router.get("/guests", response_model=list[Guest])
async def get_all_guests_async() -> list[Guest]:
    """List all guests with their RSVP status.

    Returns:
        A list of every guest record.
    """
    service = _get_guest_service()
    return await service.get_all_guests_async()


@router.post("/guests", response_model=Guest, status_code=201)
async def create_guest_async(request: CreateGuestRequest) -> Guest:
    """Add a new guest and generate their unique RSVP token.

    Args:
        request: The guest creation payload.

    Returns:
        The newly created guest record including the RSVP token.
    """
    service = _get_guest_service()
    return await service.create_guest_async(
        name=request.name,
        email=request.email,
        phone=request.phone,
        max_companions=request.max_companions,
        sponsor_role=request.sponsor_role,
    )


@router.put("/guests/{guest_id}", response_model=Guest)
async def update_guest_async(guest_id: str, request: UpdateGuestRequest) -> Guest:
    """Update a guest's personal information.

    Args:
        guest_id: The UUID of the guest to update.
        request: The updated guest data.

    Returns:
        The updated guest record.

    Raises:
        HTTPException: 404 if the guest is not found.
    """
    service = _get_guest_service()
    try:
        return await service.update_guest_async(
            guest_id=guest_id,
            name=request.name,
            email=request.email,
            phone=request.phone,
            max_companions=request.max_companions,
            sponsor_role=request.sponsor_role,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Guest not found")


@router.delete("/guests/{guest_id}", status_code=204)
async def delete_guest_async(guest_id: str) -> None:
    """Remove a guest record.

    Args:
        guest_id: The UUID of the guest to delete.

    Raises:
        HTTPException: 404 if the guest is not found.
    """
    service = _get_guest_service()
    is_deleted = await service.delete_guest_async(guest_id)
    if not is_deleted:
        raise HTTPException(status_code=404, detail="Guest not found")


@router.get("/stats", response_model=RsvpStats)
async def get_rsvp_stats_async() -> RsvpStats:
    """Calculate aggregate RSVP statistics.

    Returns:
        A summary of guest counts by RSVP status.
    """
    service = _get_guest_service()
    guests = await service.get_all_guests_async()
    attending_guests = [g for g in guests if g.rsvp_status == RsvpStatus.ATTENDING]
    total_companions = sum(len(g.companions) for g in attending_guests)
    return RsvpStats(
        total=len(guests),
        attending=len(attending_guests),
        not_attending=sum(1 for g in guests if g.rsvp_status == RsvpStatus.NOT_ATTENDING),
        pending=sum(1 for g in guests if g.rsvp_status == RsvpStatus.PENDING),
        total_companions=total_companions,
        attending_headcount=len(attending_guests) + total_companions,
    )


@router.get("/rsvp-window", response_model=RsvpWindowStatus)
async def get_rsvp_window_async() -> RsvpWindowStatus:
    """Return the current RSVP window configuration and its open/closed state.

    Returns:
        The RSVP window with a computed is_open flag.
    """
    return await _get_settings_service().get_rsvp_window_status_async()


@router.put("/rsvp-window", response_model=RsvpWindowStatus)
async def set_rsvp_window_async(window: RsvpWindow) -> RsvpWindowStatus:
    """Set the period during which guests may submit or edit their RSVP.

    Args:
        window: The new window configuration. Pass null dates to remove that boundary.

    Returns:
        The updated window with a computed is_open flag.
    """
    return await _get_settings_service().set_rsvp_window_async(window)
