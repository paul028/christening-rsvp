"""Business logic for guest management."""

import uuid
from datetime import datetime, timezone

from src.core.interfaces.guest_repository import GuestRepository
from src.core.models.guest import Guest, RsvpRequest


from src.services.token_service import TokenService


class GuestService:
    """Orchestrates guest creation, RSVP submission, and retrieval.

    Args:
        guest_repository: Storage backend for guest records.
        token_service: Generator for unique RSVP tokens.
    """

    def __init__(
        self,
        guest_repository: GuestRepository,
        token_service: TokenService,
    ) -> None:
        self._guest_repository = guest_repository
        self._token_service = token_service

    async def create_guest_async(
        self,
        name: str,
        email: str | None = None,
        phone: str | None = None,
        max_companions: int = 0,
        sponsor_role: str | None = None,
    ) -> Guest:
        """Create a new guest with a unique RSVP token.

        Args:
            name: Full name of the guest.
            email: Optional email address.
            phone: Optional phone number.
            max_companions: Maximum companions this guest may bring.
            sponsor_role: "ninong", "ninang", or None.

        Returns:
            The newly created guest record.
        """
        guest = Guest(
            id=str(uuid.uuid4()),
            name=name,
            email=email,
            phone=phone,
            token=self._token_service.generate_token(),
            max_companions=max_companions,
            sponsor_role=sponsor_role,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        return await self._guest_repository.add_async(guest)

    async def get_guest_by_token_async(self, token: str) -> Guest | None:
        """Look up a guest by their RSVP token.

        Args:
            token: The unique URL token.

        Returns:
            The guest if found, otherwise None.
        """
        return await self._guest_repository.get_by_token_async(token)

    async def submit_rsvp_async(self, token: str, rsvp_request: RsvpRequest) -> Guest:
        """Record a guest's RSVP response.

        Args:
            token: The guest's unique RSVP token.
            rsvp_request: The RSVP submission payload.

        Returns:
            The updated guest record.

        Raises:
            ValueError: If no guest is found for the given token.
        """
        guest = await self._guest_repository.get_by_token_async(token)
        if guest is None:
            raise ValueError(f"Guest not found for token: {token}")

        companions = rsvp_request.companions[: guest.max_companions]
        updated_guest = guest.model_copy(
            update={
                "rsvp_status": rsvp_request.rsvp_status,
                "companions": companions,
                "number_of_companions": len(companions),
                "dietary_restrictions": rsvp_request.dietary_restrictions,
                "message": rsvp_request.message,
                "responded_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        return await self._guest_repository.update_async(updated_guest)

    async def get_all_guests_async(self) -> list[Guest]:
        """Retrieve every guest record.

        Returns:
            A list of all guests.
        """
        return await self._guest_repository.get_all_async()

    async def delete_guest_async(self, guest_id: str) -> bool:
        """Remove a guest by ID.

        Args:
            guest_id: The UUID of the guest.

        Returns:
            True if the guest was deleted, False if not found.
        """
        return await self._guest_repository.delete_async(guest_id)

    async def update_guest_async(
        self,
        guest_id: str,
        name: str,
        email: str | None = None,
        phone: str | None = None,
        max_companions: int = 0,
        sponsor_role: str | None = None,
    ) -> Guest:
        """Update a guest's personal information.

        Args:
            guest_id: The UUID of the guest.
            name: Updated full name.
            email: Updated email address.
            phone: Updated phone number.
            max_companions: Maximum companions this guest may bring.

        Returns:
            The updated guest record.

        Raises:
            ValueError: If no guest is found for the given ID.
        """
        guest = await self._guest_repository.get_by_id_async(guest_id)
        if guest is None:
            raise ValueError(f"Guest not found for id: {guest_id}")

        updated_guest = guest.model_copy(
            update={
                "name": name,
                "email": email,
                "phone": phone,
                "max_companions": max_companions,
                "sponsor_role": sponsor_role,
            }
        )
        return await self._guest_repository.update_async(updated_guest)
