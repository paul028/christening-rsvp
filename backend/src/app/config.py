"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class AppSettings(BaseSettings):
    """Configuration for the FastAPI application.

    Values are read from environment variables (or a .env file)
    with the ``APP_`` prefix where applicable.

    Attributes:
        APP_HOST: Host address to bind to.
        APP_PORT: Port number for the server.
        DATA_DIR: Directory path for JSON data storage.
        CORS_ORIGINS: Comma-separated list of allowed CORS origins.
    """

    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DATA_DIR: str = "./data"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    def get_cors_origins_list(self) -> list[str]:
        """Parse the comma-separated CORS origins string.

        Returns:
            A list of origin URL strings.
        """
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}
