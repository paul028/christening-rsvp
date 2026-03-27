"""Abstract base class for settings persistence."""

from abc import ABC, abstractmethod

from src.core.models.rsvp_window import RsvpWindow


class SettingsRepository(ABC):
    """Interface for application settings storage."""

    @abstractmethod
    async def get_rsvp_window_async(self) -> RsvpWindow:
        """Retrieve the current RSVP window configuration.

        Returns:
            The stored RsvpWindow, or a default (unrestricted) instance if not set.
        """

    @abstractmethod
    async def set_rsvp_window_async(self, window: RsvpWindow) -> RsvpWindow:
        """Persist the RSVP window configuration.

        Args:
            window: The window to store.

        Returns:
            The stored window.
        """
