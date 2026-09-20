from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_performance_record():
    email = "performance_test_unique@example.com"
    password = "Test@12345"

    client.post(
        "/api/auth/register",
        json={
            "name": "Performance Test User",
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

    profile_response = client.get(
        "/api/users/me",
        headers=headers,
    )

    assert profile_response.status_code == 200
    user_id = profile_response.json()["id"]

    performance_response = client.post(
        "/api/performance",
        headers=headers,
        json={
            "user_id": user_id,
            "calls_handled": 10,
            "successful_calls": 6,
            "conversion_rate": 60.0,
            "performance_score": 80.0,
        },
    )

    assert performance_response.status_code == 201

    list_response = client.get(
        "/api/performance",
        headers=headers,
    )

    assert list_response.status_code == 200


def test_create_coaching_record():
    email = "coaching_test_unique@example.com"
    password = "Test@12345"

    client.post(
        "/api/auth/register",
        json={
            "name": "Coaching Test User",
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

    profile_response = client.get(
        "/api/users/me",
        headers=headers,
    )

    assert profile_response.status_code == 200
    user_id = profile_response.json()["id"]

    coaching_response = client.post(
        "/api/coaching",
        headers=headers,
        json={
            "user_id": user_id,
            "feedback": "Improve follow-up consistency.",
            "improvement_plan": "Practice follow-up calls daily.",
        },
    )

    assert coaching_response.status_code == 201

    list_response = client.get(
        "/api/coaching",
        headers=headers,
    )

    assert list_response.status_code == 200