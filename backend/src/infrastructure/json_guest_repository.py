"""JSON file-based implementation of the guest repository."""

import asyncio
import json
from pathlib import Path

from src.core.interfaces.guest_repository import GuestRepository
from src.core.models.guest import Guest


class JsonGuestRepository(GuestRepository):
    """Persists guest records in a JSON file.

    Uses an asyncio lock to ensure thread-safe read/write access
    to the underlying file.

    Args:
        file_path: Path to the JSON storage file.
    """

    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path
        self._lock = asyncio.Lock()
        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        """Create the JSON file with an empty array if it does not exist."""
        if not self._file_path.exists():
            self._file_path.parent.mkdir(parents=True, exist_ok=True)
            self._file_path.write_text("[]")

    def _read_all(self) -> list[Guest]:
        """Read and deserialize all guests from the JSON file.

        Returns:
            A list of Guest objects.
        """
        raw = json.loads(self._file_path.read_text())
        return [Guest.model_validate(item) for item in raw]

    def _write_all(self, guests: list[Guest]) -> None:
        """Serialize and write all guests to the JSON file.

        Args:
            guests: The full list of guests to persist.
        """
        data = [guest.model_dump() for guest in guests]
        self._file_path.write_text(json.dumps(data, indent=2))

    async def add_async(self, guest: Guest) -> Guest:
        """Persist a new guest record.

        Args:
            guest: The guest entity to store.

        Returns:
            The stored guest entity.
        """
        async with self._lock:
            guests = self._read_all()
            guests.append(guest)
            self._write_all(guests)
            return guest

    async def get_by_id_async(self, guest_id: str) -> Guest | None:
        """Retrieve a guest by their unique ID.

        Args:
            guest_id: The UUID of the guest.

        Returns:
            The guest if found, otherwise None.
        """
        async with self._lock:
            guests = self._read_all()
            for guest in guests:
                if guest.id == guest_id:
                    return guest
            return None

    async def get_by_token_async(self, token: str) -> Guest | None:
        """Retrieve a guest by their RSVP URL token.

        Args:
            token: The unique RSVP token.

        Returns:
            The guest if found, otherwise None.
        """
        async with self._lock:
            guests = self._read_all()
            for guest in guests:
                if guest.token == token:
                    return guest
            return None

    async def get_all_async(self) -> list[Guest]:
        """Retrieve all guest records.

        Returns:
            A list of all guests.
        """
        async with self._lock:
            return self._read_all()

    async def update_async(self, guest: Guest) -> Guest:
        """Update an existing guest record.

        Args:
            guest: The guest entity with updated fields.

        Returns:
            The updated guest entity.

        Raises:
            ValueError: If the guest ID is not found.
        """
        async with self._lock:
            guests = self._read_all()
            for i, existing in enumerate(guests):
                if existing.id == guest.id:
                    guests[i] = guest
                    self._write_all(guests)
                    return guest
            raise ValueError(f"Guest not found for id: {guest.id}")

    async def delete_async(self, guest_id: str) -> bool:
        """Remove a guest record by ID.

        Args:
            guest_id: The UUID of the guest to remove.

        Returns:
            True if the guest was deleted, False if not found.
        """
        async with self._lock:
            guests = self._read_all()
            original_count = len(guests)
            guests = [g for g in guests if g.id != guest_id]
            if len(guests) < original_count:
                self._write_all(guests)
                return True
            return False
