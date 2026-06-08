import pytest
from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime


client = TestClient(app)


def test_health_check():
    """Test that /api/health returns 200 OK with correct response format"""
    response = client.get("/api/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert isinstance(data["timestamp"], str)


def test_health_check_response_structure():
    """Test that health response has correct structure and types"""
    response = client.get("/api/health")
    data = response.json()
    assert isinstance(data, dict)
    assert set(data.keys()) == {"status", "timestamp"}
    assert data["status"] == "ok"


def test_health_check_timestamp_format():
    """Test that timestamp is valid ISO8601 format"""
    response = client.get("/api/health")
    data = response.json()
    timestamp = data["timestamp"]
    # Verify timestamp is parseable as ISO8601
    try:
        datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    except ValueError:
        pytest.fail(f"Invalid ISO8601 timestamp: {timestamp}")
