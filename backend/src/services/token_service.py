"""Service for generating unique URL tokens."""

import secrets
import string


class TokenService:
    """Generates short, URL-safe tokens for guest RSVP links."""

    _TOKEN_LENGTH = 8
    _ALPHABET = string.ascii_lowercase + string.digits

    def generate_token(self) -> str:
        """Generate a short, unique, URL-safe token.

        Returns:
            A random alphanumeric string of fixed length.
        """
        return "".join(secrets.choice(self._ALPHABET) for _ in range(self._TOKEN_LENGTH))
