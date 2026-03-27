"""JSON file-based implementation of the settings repository."""

import asyncio
import json
from pathlib import Path

from src.core.interfaces.settings_repository import SettingsRepository
from src.core.models.rsvp_window import RsvpWindow


class JsonSettingsRepository(SettingsRepository):
    """Persists application settings in a JSON file.

    Args:
        file_path: Path to the settings JSON file.
    """

    def __init__(self, file_path: Path) -> None:
        self._file_path = file_path
        self._lock = asyncio.Lock()
        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        """Create the settings file with empty defaults if it does not exist."""
        if not self._file_path.exists():
            self._file_path.parent.mkdir(parents=True, exist_ok=True)
            self._file_path.write_text(json.dumps({}))

    def _read_raw(self) -> dict:
        return json.loads(self._file_path.read_text())

    def _write_raw(self, data: dict) -> None:
        self._file_path.write_text(json.dumps(data, indent=2))

    async def get_rsvp_window_async(self) -> RsvpWindow:
        """Retrieve the current RSVP window configuration.

        Returns:
            The stored RsvpWindow, or a default unrestricted instance if not set.
        """
        async with self._lock:
            data = self._read_raw()
            return RsvpWindow(**data.get("rsvp_window", {}))

    async def set_rsvp_window_async(self, window: RsvpWindow) -> RsvpWindow:
        """Persist the RSVP window configuration.

        Args:
            window: The window to store.

        Returns:
            The stored window.
        """
        async with self._lock:
            data = self._read_raw()
            data["rsvp_window"] = window.model_dump()
            self._write_raw(data)
            return window
