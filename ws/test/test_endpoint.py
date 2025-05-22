# ws/test/test_endpoint.py

import pytest
from fastapi.testclient import TestClient
from datetime import timedelta
from ws.covid_api import app, create_access_token, get_db
import os

client = TestClient(app)

# Configuration pour les tokens
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"

def generate_token(username="testuser"):
    payload = {"sub": username}
    expires = timedelta(minutes=30)
    return create_access_token(data=payload, expires_delta=expires)

@pytest.mark.endpoint
class TestEndpoint:

    @pytest.fixture
    def token(self):
        return generate_token()

    def test_get_all_entries_success(self, token, mocker):
        # Simulation du curseur DB avec mocker (pytest-mock)
        mock_cursor = mocker.MagicMock()
        mock_cursor.fetchall.return_value = [
            {
                "country": "France",
                "continent": "Europe",
                "who_region": "EURO",
                "population": 67000000,
                "total_cases": 100000,
                "total_deaths": 2000,
                "total_recovered": 95000,
                "serious_critical": 300,
                "total_tests": 1200000
            }
        ]

        mocker.patch("ws.covid_api.get_db", return_value=iter([mock_cursor]))

        response = client.get("/covid", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert "data" in response.json()
        assert isinstance(response.json()["data"], list)
        assert response.json()["data"][0]["country"] == "France"

    def test_get_all_entries_empty(self, token, mocker):
        mock_cursor = mocker.MagicMock()
        mock_cursor.fetchall.return_value = []

        mocker.patch("ws.covid_api.get_db", return_value=iter([mock_cursor]))

        response = client.get("/covid", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 404
        assert response.json()["detail"] == "No data found"
