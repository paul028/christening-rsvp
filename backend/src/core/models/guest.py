"""Guest domain models."""

from enum import StrEnum

from pydantic import BaseModel


class RsvpStatus(StrEnum):
    """Enumeration of possible RSVP statuses."""

    PENDING = "pending"
    ATTENDING = "attending"
    NOT_ATTENDING = "not_attending"


class Guest(BaseModel):
    """Represents an invited guest and their RSVP state.

    Attributes:
        id: Unique identifier (UUID).
        name: Full name of the guest.
        email: Optional email address.
        phone: Optional phone number.
        token: Unique URL token used for the RSVP link.
        rsvp_status: Current RSVP status.
        number_of_companions: Number of additional companions.
        dietary_restrictions: Optional dietary notes.
        message: Optional congratulatory message.
        responded_at: ISO datetime when the guest responded.
        created_at: ISO datetime when the guest record was created.
    """

    id: str
    name: str
    email: str | None = None
    phone: str | None = None
    token: str
    rsvp_status: RsvpStatus = RsvpStatus.PENDING
    number_of_companions: int = 0
    dietary_restrictions: str | None = None
    message: str | None = None
    responded_at: str | None = None
    created_at: str


class RsvpRequest(BaseModel):
    """Payload for submitting an RSVP response.

    Attributes:
        rsvp_status: The guest's attendance decision.
        number_of_companions: How many additional people they are bringing.
        dietary_restrictions: Any dietary needs.
        message: Optional congratulatory message.
    """

    rsvp_status: RsvpStatus
    number_of_companions: int = 0
    dietary_restrictions: str | None = None
    message: str | None = None
