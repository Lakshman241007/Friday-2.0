from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_and_list_report():
    email = "report_test_unique@example.com"
    password = "Test@12345"

    client.post(
        "/api/auth/register",
        json={
            "name": "Report Test User",
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

    report_response = client.post(
        "/api/reports",
        headers=headers,
        json={
            "title": "Test Performance Report",
            "report_type": "Performance",
            "content": "This is a test report.",
        },
    )

    assert report_response.status_code == 201
    assert report_response.json()["title"] == "Test Performance Report"

    list_response = client.get(
        "/api/reports",
        headers=headers,
    )

    assert list_response.status_code == 200
    assert isinstance(list_response.json(), list)