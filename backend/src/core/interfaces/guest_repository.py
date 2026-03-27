"""Abstract base class for guest persistence."""

from abc import ABC, abstractmethod

from src.core.models.guest import Guest


class GuestRepository(ABC):
    """Interface for guest storage operations.

    All implementations must provide async methods for CRUD
    operations on Guest entities.
    """

    @abstractmethod
    async def add_async(self, guest: Guest) -> Guest:
        """Persist a new guest record.

        Args:
            guest: The guest entity to store.

        Returns:
            The stored guest entity.
        """

    @abstractmethod
    async def get_by_id_async(self, guest_id: str) -> Guest | None:
        """Retrieve a guest by their unique ID.

        Args:
            guest_id: The UUID of the guest.

        Returns:
            The guest if found, otherwise None.
        """

    @abstractmethod
    async def get_by_token_async(self, token: str) -> Guest | None:
        """Retrieve a guest by their RSVP URL token.

        Args:
            token: The unique RSVP token.

        Returns:
            The guest if found, otherwise None.
        """

    @abstractmethod
    async def get_all_async(self) -> list[Guest]:
        """Retrieve all guest records.

        Returns:
            A list of all guests.
        """

    @abstractmethod
    async def update_async(self, guest: Guest) -> Guest:
        """Update an existing guest record.

        Args:
            guest: The guest entity with updated fields.

        Returns:
            The updated guest entity.
        """

    @abstractmethod
    async def delete_async(self, guest_id: str) -> bool:
        """Remove a guest record by ID.

        Args:
            guest_id: The UUID of the guest to remove.

        Returns:
            True if the guest was deleted, False if not found.
        """
