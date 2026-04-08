"""Guest domain models."""

from enum import StrEnum

from pydantic import BaseModel


class RsvpStatus(StrEnum):
    """Enumeration of possible RSVP statuses."""

    PENDING = "pending"
    ATTENDING = "attending"
    NOT_ATTENDING = "not_attending"


class Companion(BaseModel):
    """A companion attending with a guest.

    Attributes:
        first_name: Companion's first name.
        last_name: Companion's last name.
        dietary_restrictions: Optional dietary notes.
    """

    first_name: str
    last_name: str
    dietary_restrictions: str | None = None


class Guest(BaseModel):
    """Represents an invited guest and their RSVP state.

    Attributes:
        id: Unique identifier (UUID).
        name: Full name of the guest.
        email: Optional email address.
        phone: Optional phone number.
        token: Unique URL token used for the RSVP link.
        rsvp_status: Current RSVP status.
        max_companions: Maximum companions this guest may bring.
        companions: List of confirmed companions with their details.
        number_of_companions: Derived count of companions (len of companions list).
        dietary_restrictions: Optional dietary notes for the guest.
        message: Optional congratulatory message.
        responded_at: ISO datetime when the guest responded.
        created_at: ISO datetime when the guest record was created.
    """

    id: str
    name: str
    email: str | None = None
    phone: str | None = None
    token: str
    sponsor_role: str | None = None  # "ninong" | "ninang" | None
    rsvp_status: RsvpStatus = RsvpStatus.PENDING
    max_companions: int = 0
    companions: list[Companion] = []
    number_of_companions: int = 0
    dietary_restrictions: str | None = None
    message: str | None = None
    responded_at: str | None = None
    created_at: str


class RsvpRequest(BaseModel):
    """Payload for submitting an RSVP response.

    Attributes:
        rsvp_status: The guest's attendance decision.
        companions: List of companions with their names and dietary needs.
        dietary_restrictions: Dietary needs for the guest themselves.
        message: Optional congratulatory message.
    """

    rsvp_status: RsvpStatus
    companions: list[Companion] = []
    dietary_restrictions: str | None = None
    message: str | None = None
