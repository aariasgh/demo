"""Tests for GET /api/leads endpoint - Lead listing functionality"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_leads_returns_paginated_response(client: AsyncClient):
    """GET /api/leads should return the lead list with metadata."""
    for i, email in enumerate(["lead-a@test.com", "lead-b@test.com"], start=1):
        response = await client.post(
            "/api/leads",
            json={
                "name": f"Lead {i}",
                "company": f"Company {i}",
                "email": email,
            },
        )
        assert response.status_code == 201

    response = await client.get("/api/leads")

    assert response.status_code == 200
    payload = response.json()
    assert "data" in payload
    assert "meta" in payload
    assert len(payload["data"]) == 2
    assert payload["meta"]["total"] == 2
    assert payload["meta"]["limit"] == 100
    assert payload["meta"]["offset"] == 0


@pytest.mark.asyncio
async def test_get_leads_filters_by_status(client: AsyncClient):
    """GET /api/leads?status=... should filter results by status."""
    first = await client.post(
        "/api/leads",
        json={"name": "Lead Nuevo", "company": "Company A", "email": "nuevo@test.com", "priority": "Media"},
    )
    second = await client.post(
        "/api/leads",
        json={"name": "Lead Contacto", "company": "Company B", "email": "contacto@test.com", "priority": "Alta"},
    )

    assert first.status_code == 201
    assert second.status_code == 201

    lead_id = second.json()["id"]
    update_response = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "En contacto"},
    )
    assert update_response.status_code == 200

    response = await client.get("/api/leads?status=En%20contacto")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["data"]) == 1
    assert payload["data"][0]["id"] == lead_id
    assert payload["data"][0]["status"] == "En contacto"


@pytest.mark.asyncio
async def test_get_leads_rejects_invalid_status_value(client: AsyncClient):
    """GET /api/leads should reject invalid status values with 422."""
    response = await client.get("/api/leads?status=INVALIDO")

    assert response.status_code == 422


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("query_string", "expected_status"),
    [
        ("/api/leads?limit=0", 422),
        ("/api/leads?limit=1001", 422),
        ("/api/leads?offset=-1", 422),
    ],
)
async def test_get_leads_rejects_invalid_pagination_params(
    client: AsyncClient,
    query_string: str,
    expected_status: int,
):
    """GET /api/leads should validate pagination boundaries."""
    response = await client.get(query_string)

    assert response.status_code == expected_status


@pytest.mark.asyncio
async def test_get_leads_orders_by_created_at_desc(client: AsyncClient):
    """GET /api/leads should order results from newest to oldest."""
    older = await client.post(
        "/api/leads",
        json={"name": "Lead Older", "company": "Company A", "email": "older@test.com"},
    )
    newer = await client.post(
        "/api/leads",
        json={"name": "Lead Newer", "company": "Company B", "email": "newer@test.com"},
    )

    assert older.status_code == 201
    assert newer.status_code == 201

    response = await client.get("/api/leads")

    assert response.status_code == 200
    payload = response.json()
    created_at_values = [item["created_at"] for item in payload["data"]]
    assert created_at_values == sorted(created_at_values, reverse=True)
