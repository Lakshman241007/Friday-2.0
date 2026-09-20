from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_and_login():
    email = "test_auth_unique@example.com"
    password = "Test@12345"

    register_response = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code in [201, 409]

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200
    assert "access_token" in login_response.json()