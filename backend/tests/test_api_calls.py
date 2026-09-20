from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_and_update_call():
    email = "calls_test_unique@example.com"
    password = "Test@12345"

    client.post(
        "/api/auth/register",
        json={
            "name": "Calls Test User",
            "email": email,
            "password": password,
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    lead_response = client.post(
        "/api/leads",
        headers=headers,
        json={
            "name": "Call Test Lead",
            "email": "call_lead_unique@example.com",
            "company": "Test Company",
        },
    )

    assert lead_response.status_code == 201
    lead_id = lead_response.json()["id"]

    call_response = client.post(
        "/api/calls",
        headers=headers,
        json={
            "lead_id": lead_id,
            "agent_id": 1,
        },
    )

    assert call_response.status_code == 201
    call_id = call_response.json()["id"]

    update_response = client.patch(
        f"/api/calls/{call_id}",
        headers=headers,
        json={
            "status": "Completed",
            "outcome": "Interested",
            "notes": "Test call completed",
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["status"] == "Completed"