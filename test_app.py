import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_home_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Hello from E10 CI/CD Pipeline!" in response.data


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.is_json
    assert response.get_json() == {"status": "healthy"}


def test_not_found_endpoint(client):
    response = client.get("/non-existent-endpoint")
    assert response.status_code == 404


def test_health_invalid_method(client):
    response = client.post("/health")
    assert response.status_code == 405