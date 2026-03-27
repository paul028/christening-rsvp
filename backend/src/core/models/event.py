"""Event details model."""

from pydantic import BaseModel


class Event(BaseModel):
    """Static configuration for the christening event.

    Attributes:
        title: Display title for the event.
        baby_name: Name of the baby (placeholder by default).
        date: Human-readable date string.
        time: Human-readable time string.
        church_name: Name and diocese of the church.
        church_map_url: Google Maps link for the church.
        reception_venue: Name of the reception venue.
        reception_map_url: Google Maps link for the reception.
    """

    title: str = "Baby's Christening"
    baby_name: str = "Baby"
    date: str = "May 16, 2026"
    time: str = "11:00 AM"
    church_name: str = "Mary the Queen Parish, Diocese of Novaliches"
    church_map_url: str = "https://share.google/uTAkofHats2o7UATM"
    reception_venue: str = "Lasa SM Fairview"
    reception_map_url: str = "https://share.google/gBZW5Q3hQ6IEsYRKB"
