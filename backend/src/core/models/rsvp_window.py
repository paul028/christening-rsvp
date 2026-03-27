"""RSVP window model."""

from pydantic import BaseModel


class RsvpWindow(BaseModel):
    """Defines the period during which guests may submit or edit their RSVP.

    A None value means that boundary is unrestricted.

    Attributes:
        start_date: ISO datetime string from which RSVPs are accepted.
        end_date: ISO datetime string after which RSVPs are no longer accepted.
    """

    start_date: str | None = None
    end_date: str | None = None


class RsvpWindowStatus(RsvpWindow):
    """RsvpWindow with a computed open/closed flag.

    Attributes:
        is_open: True if the current time falls within the configured window.
    """

    is_open: bool
