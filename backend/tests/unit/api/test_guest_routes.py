"""Unit tests for guest API routes."""

import pytest
from httpx import ASGITransport, AsyncClient

from src.app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


class TestGuestRoutes:
    """Integration tests for the guest-facing API endpoints."""

    @pytest.mark.asyncio
    async def test_health_check_should_return_ok(self) -> None:
        # Arrange
        transport = ASGITransport(app=app)

        # Act
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/health")

        # Assert
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    @pytest.mark.asyncio
    async def test_get_event_details_should_return_event(self) -> None:
        # Arrange
        transport = ASGITransport(app=app)

        # Act
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/event")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Baby's Christening"
        assert data["church_name"] == "Mary the Queen Parish, Diocese of Novaliches"

    @pytest.mark.asyncio
    async def test_get_guest_by_token_should_return_404_when_not_found(self) -> None:
        # Arrange
        transport = ASGITransport(app=app)

        # Act
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/guests/nonexistent-token")

        # Assert
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_admin_create_and_rsvp_flow(self) -> None:
        # Arrange
        transport = ASGITransport(app=app)

        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Act - create guest
            create_response = await client.post(
                "/api/admin/guests",
                json={"name": "Test User", "email": "test@example.com"},
            )

            # Assert - guest created
            assert create_response.status_code == 201
            guest_data = create_response.json()
            assert guest_data["name"] == "Test User"
            token = guest_data["token"]

            # Act - submit RSVP
            rsvp_response = await client.post(
                f"/api/guests/{token}/rsvp",
                json={
                    "rsvp_status": "attending",
                    "number_of_companions": 1,
                    "message": "So happy!",
                },
            )

            # Assert - RSVP recorded
            assert rsvp_response.status_code == 200
            rsvp_data = rsvp_response.json()
            assert rsvp_data["rsvp_status"] == "attending"
            assert rsvp_data["number_of_companions"] == 1

            # Act - check stats
            stats_response = await client.get("/api/admin/stats")

            # Assert - stats reflect the RSVP
            assert stats_response.status_code == 200
            stats = stats_response.json()
            assert stats["attending"] >= 1
