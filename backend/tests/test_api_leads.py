from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_lead():
    email = "lead_test_unique@example.com"
    password = "Test@12345"

    client.post(
        "/api/auth/register",
        json={
            "name": "Lead Test User",
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

    response = client.post(
        "/api/leads",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Test Lead",
            "email": "testlead_unique@example.com",
            "phone": "9876543210",
            "company": "Test Company",
            "source": "Automated Test",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "Test Lead"