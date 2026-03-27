"""Unit tests for GuestService."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from src.core.models.guest import Guest, RsvpRequest, RsvpStatus
from src.services.guest_service import GuestService


def _create_guest(
    guest_id: str = "test-id",
    name: str = "Test Guest",
    token: str = "abc12345",
    rsvp_status: RsvpStatus = RsvpStatus.PENDING,
) -> Guest:
    """Create a Guest instance for testing.

    Args:
        guest_id: UUID string for the guest.
        name: Guest's full name.
        token: RSVP URL token.
        rsvp_status: Current RSVP status.

    Returns:
        A Guest model instance.
    """
    return Guest(
        id=guest_id,
        name=name,
        token=token,
        rsvp_status=rsvp_status,
        max_companions=5,
        created_at="2026-01-01T00:00:00+00:00",
    )


def _create_sut(
    repository: AsyncMock | None = None,
    token_service: MagicMock | None = None,
) -> GuestService:
    """Create a GuestService with mock dependencies.

    Args:
        repository: Mock guest repository. Created if not provided.
        token_service: Mock token service. Created if not provided.

    Returns:
        A configured GuestService instance.
    """
    if repository is None:
        repository = AsyncMock()
    if token_service is None:
        token_service = MagicMock()
        token_service.generate_token.return_value = "abc12345"
    return GuestService(guest_repository=repository, token_service=token_service)


class TestCreateGuestAsync:
    """Tests for GuestService.create_guest_async."""

    @pytest.mark.asyncio
    async def test_create_guest_async_should_return_guest_with_token_when_valid_name(
        self,
    ) -> None:
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.add_async.side_effect = lambda g: g
        sut = _create_sut(repository=mock_repo)

        # Act
        result = await sut.create_guest_async(name="Maria Santos")

        # Assert
        assert result.name == "Maria Santos"
        assert result.token == "abc12345"
        assert result.rsvp_status == RsvpStatus.PENDING
        mock_repo.add_async.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_create_guest_async_should_include_email_when_provided(self) -> None:
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.add_async.side_effect = lambda g: g
        sut = _create_sut(repository=mock_repo)

        # Act
        result = await sut.create_guest_async(
            name="Maria Santos", email="maria@example.com"
        )

        # Assert
        assert result.email == "maria@example.com"


class TestGetGuestByTokenAsync:
    """Tests for GuestService.get_guest_by_token_async."""

    @pytest.mark.asyncio
    async def test_get_guest_by_token_async_should_return_guest_when_token_exists(
        self,
    ) -> None:
        # Arrange
        expected_guest = _create_guest()
        mock_repo = AsyncMock()
        mock_repo.get_by_token_async.return_value = expected_guest
        sut = _create_sut(repository=mock_repo)

        # Act
        result = await sut.get_guest_by_token_async("abc12345")

        # Assert
        assert result == expected_guest

    @pytest.mark.asyncio
    async def test_get_guest_by_token_async_should_return_none_when_token_not_found(
        self,
    ) -> None:
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_by_token_async.return_value = None
        sut = _create_sut(repository=mock_repo)

        # Act
        result = await sut.get_guest_by_token_async("nonexistent")

        # Assert
        assert result is None


class TestSubmitRsvpAsync:
    """Tests for GuestService.submit_rsvp_async."""

    @pytest.mark.asyncio
    async def test_submit_rsvp_async_should_update_status_when_valid_token(self) -> None:
        # Arrange
        existing_guest = _create_guest()
        mock_repo = AsyncMock()
        mock_repo.get_by_token_async.return_value = existing_guest
        mock_repo.update_async.side_effect = lambda g: g
        sut = _create_sut(repository=mock_repo)
        from src.core.models.guest import Companion
        rsvp_request = RsvpRequest(
            rsvp_status=RsvpStatus.ATTENDING,
            companions=[
                Companion(first_name="Ana", last_name="Santos"),
                Companion(first_name="Jose", last_name="Santos"),
            ],
            message="Congratulations!",
        )

        # Act
        result = await sut.submit_rsvp_async("abc12345", rsvp_request)

        # Assert
        assert result.rsvp_status == RsvpStatus.ATTENDING
        assert result.number_of_companions == 2
        assert len(result.companions) == 2
        assert result.message == "Congratulations!"
        assert result.responded_at is not None
        mock_repo.update_async.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_submit_rsvp_async_should_raise_when_token_not_found(self) -> None:
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_by_token_async.return_value = None
        sut = _create_sut(repository=mock_repo)
        rsvp_request = RsvpRequest(rsvp_status=RsvpStatus.ATTENDING)

        # Act & Assert
        with pytest.raises(ValueError, match="Guest not found"):
            await sut.submit_rsvp_async("nonexistent", rsvp_request)


class TestDeleteGuestAsync:
    """Tests for GuestService.delete_guest_async."""

    @pytest.mark.asyncio
    async def test_delete_guest_async_should_return_true_when_guest_exists(self) -> None:
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.delete_async.return_value = True
        sut = _create_sut(repository=mock_repo)

        # Act
        result = await sut.delete_guest_async("test-id")

        # Assert
        assert result is True


class TestUpdateGuestAsync:
    """Tests for GuestService.update_guest_async."""

    @pytest.mark.asyncio
    async def test_update_guest_async_should_raise_when_guest_not_found(self) -> None:
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_by_id_async.return_value = None
        sut = _create_sut(repository=mock_repo)

        # Act & Assert
        with pytest.raises(ValueError, match="Guest not found"):
            await sut.update_guest_async("nonexistent", name="New Name")
