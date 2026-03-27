"""Unit tests for TokenService."""

from src.services.token_service import TokenService


class TestTokenService:
    """Tests for TokenService.generate_token."""

    def _create_sut(self) -> TokenService:
        """Create a TokenService instance for testing.

        Returns:
            A fresh TokenService.
        """
        return TokenService()

    def test_generate_token_should_return_string_when_called(self) -> None:
        # Arrange
        sut = self._create_sut()

        # Act
        result = sut.generate_token()

        # Assert
        assert isinstance(result, str)
        assert len(result) == 8

    def test_generate_token_should_return_alphanumeric_when_called(self) -> None:
        # Arrange
        sut = self._create_sut()

        # Act
        result = sut.generate_token()

        # Assert
        assert result.isalnum()

    def test_generate_token_should_return_unique_strings_when_called_multiple_times(self) -> None:
        # Arrange
        sut = self._create_sut()

        # Act
        tokens = {sut.generate_token() for _ in range(100)}

        # Assert
        assert len(tokens) == 100
