"""HTTP Basic auth dependency for admin endpoints."""

import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from src.app.config import AppSettings


_security = HTTPBasic()
_settings = AppSettings()


def require_admin(credentials: HTTPBasicCredentials = Depends(_security)) -> str:
    """Validate HTTP Basic credentials against configured admin user.

    Returns:
        The authenticated username.

    Raises:
        HTTPException: 401 if credentials are missing or invalid.
    """
    user_ok = secrets.compare_digest(credentials.username, _settings.ADMIN_USERNAME)
    pass_ok = secrets.compare_digest(credentials.password, _settings.ADMIN_PASSWORD)
    if not (user_ok and pass_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username
