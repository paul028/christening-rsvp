"""Business logic for application settings."""

from datetime import datetime, timezone

from src.core.interfaces.settings_repository import SettingsRepository
from src.core.models.rsvp_window import RsvpWindow, RsvpWindowStatus


class SettingsService:
    """Manages application settings and RSVP window enforcement.

    Args:
        settings_repository: Storage backend for settings.
    """

    def __init__(self, settings_repository: SettingsRepository) -> None:
        self._repo = settings_repository

    async def get_rsvp_window_status_async(self) -> RsvpWindowStatus:
        """Return the RSVP window with a computed is_open flag.

        Returns:
            RsvpWindowStatus with current open/closed state.
        """
        window = await self._repo.get_rsvp_window_async()
        return RsvpWindowStatus(
            start_date=window.start_date,
            end_date=window.end_date,
            is_open=self._compute_is_open(window),
        )

    async def set_rsvp_window_async(self, window: RsvpWindow) -> RsvpWindowStatus:
        """Persist the RSVP window and return the updated status.

        Args:
            window: The new window configuration.

        Returns:
            RsvpWindowStatus with updated open/closed state.
        """
        saved = await self._repo.set_rsvp_window_async(window)
        return RsvpWindowStatus(
            start_date=saved.start_date,
            end_date=saved.end_date,
            is_open=self._compute_is_open(saved),
        )

    async def is_rsvp_open_async(self) -> bool:
        """Check whether the RSVP window is currently open.

        Returns:
            True if guests may submit or edit their RSVP right now.
        """
        window = await self._repo.get_rsvp_window_async()
        return self._compute_is_open(window)

    def _compute_is_open(self, window: RsvpWindow) -> bool:
        """Evaluate whether the given window allows responses at the current time.

        Args:
            window: The RSVP window to evaluate.

        Returns:
            True if the current UTC time falls within the window.
        """
        now = datetime.now(timezone.utc)
        if window.start_date:
            start = datetime.fromisoformat(window.start_date)
            if now < start:
                return False
        if window.end_date:
            end = datetime.fromisoformat(window.end_date)
            if now > end:
                return False
        return True
