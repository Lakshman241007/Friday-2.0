from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_recording_and_transcript():
    email = "media_test_unique@example.com"
    password = "Test@12345"

    client.post(
        "/api/auth/register",
        json={
            "name": "Media Test User",
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
        json={
            "name": "Media Test Lead",
            "email": "media_lead_unique@example.com",
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

    recording_response = client.post(
        "/api/recordings",
        headers=headers,
        json={
            "call_id": call_id,
            "file_url": "https://example.com/test-recording.mp3",
            "duration_seconds": 120,
            "file_format": "mp3",
        },
    )

    assert recording_response.status_code == 201
    assert recording_response.json()["call_id"] == call_id

    transcript_response = client.post(
        "/api/transcripts",
        headers=headers,
        json={
            "call_id": call_id,
            "text": "This is a test transcript.",
        },
    )

    assert transcript_response.status_code == 201
    assert transcript_response.json()["call_id"] == call_id