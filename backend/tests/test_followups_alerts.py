from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_and_list_followup():
    email = "followup_test_unique@example.com"
    password = "Test@12345"

    client.post(
        "/api/auth/register",
        json={
            "name": "Follow-up Test User",
            "email": email,
            "password": password,
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    lead_response = client.post(
        "/api/leads",
        headers=headers,
        json={"name": "Follow-up Test Lead"},
    )

    assert lead_response.status_code == 201
    lead_id = lead_response.json()["id"]

    scheduled_at = (
        datetime.now(timezone.utc) + timedelta(days=1)
    ).isoformat()

    followup_response = client.post(
        "/api/follow-ups",
        headers=headers,
        json={
            "lead_id": lead_id,
            "assigned_to": 1,
            "scheduled_at": scheduled_at,
            "notes": "Test follow-up",
        },
    )

    assert followup_response.status_code == 201

    list_response = client.get(
        "/api/follow-ups",
        headers=headers,
    )

    assert list_response.status_code == 200
    assert isinstance(list_response.json(), list)