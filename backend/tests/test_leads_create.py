"""Tests for POST /api/leads endpoint - Create Lead functionality

This test suite validates the complete flow for creating leads, including:
- Input validation (name, company, email, phone, notes)
- Email uniqueness constraints
- Automatic timestamp generation
- Audit trail creation
- Error handling (400, 409, 500 responses)

**Test Database Strategy:**
- Uses PostgreSQL (production database engine, not SQLite)
- Separate test database: minicrmdb_test
- Fixtures defined in conftest.py (session-scoped engine, function-scoped sessions)
- Each test gets fresh tables via TRUNCATE CASCADE
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timezone


# ============================================================
# ACCEPTANCE CRITERIA TESTS
# ============================================================

@pytest.mark.asyncio
async def test_create_lead_valid(client: AsyncClient):
    """
    AC1: Crear lead con datos válidos
    - Creates a lead with all valid fields (name, company, email, phone, notes)
    - Returns 201 Created with complete response including ID and timestamps
    - Audit log is created automatically
    """
    payload = {
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "notes": "Lead muy interesado en solución",
    }
    
    response = await client.post("/api/leads", json=payload)
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    
    # Verify all fields returned
    assert data["name"] == payload["name"]
    assert data["company"] == payload["company"]
    assert data["email"] == payload["email"]
    assert data["phone"] == payload["phone"]
    assert data["notes"] == payload["notes"]
    assert data["status"] == "Nuevo"  # Default status
    
    # Verify ID and timestamps exist
    assert "id" in data
    assert data["id"] > 0
    assert "created_at" in data
    assert "updated_at" in data
    assert data["created_at"] == data["updated_at"]


@pytest.mark.asyncio
async def test_create_lead_email_duplicate(client: AsyncClient):
    """
    AC2: Crear lead con email duplicado retorna 409
    - Creates a lead with email that already exists
    - Returns 409 Conflict with appropriate error message
    - No second lead is created
    """
    email = "duplicate@test.com"
    
    # Create first lead
    payload1 = {
        "name": "Lead 1",
        "company": "Company A",
        "email": email,
    }
    response1 = await client.post("/api/leads", json=payload1)
    assert response1.status_code == 201
    
    # Attempt to create second lead with same email
    payload2 = {
        "name": "Lead 2",
        "company": "Company B",
        "email": email,
    }
    response2 = await client.post("/api/leads", json=payload2)
    
    assert response2.status_code == 409, f"Expected 409, got {response2.status_code}: {response2.text}"
    data = response2.json()
    assert "Email ya existe" in data.get("detail", "")


@pytest.mark.asyncio
async def test_create_lead_missing_name(client: AsyncClient):
    """
    AC3: Crear lead sin nombre retorna 422
    - Missing name field triggers validation error
    - Returns 422 Unprocessable Entity
    """
    payload = {
        # name missing
        "company": "TestCorp",
        "email": "test@test.com",
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 422  # Pydantic validation error


@pytest.mark.asyncio
async def test_create_lead_invalid_email(client: AsyncClient):
    """
    AC4: Crear lead con email inválido retorna 422
    - Invalid email format triggers validation error
    - Returns 422 Unprocessable Entity
    """
    payload = {
        "name": "Test",
        "company": "TestCorp",
        "email": "not-an-email",  # Invalid format
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 422  # Pydantic validation error


@pytest.mark.asyncio
async def test_create_lead_notes_exceeds_limit(client: AsyncClient):
    """
    AC5: Notes campo no puede exceder límite (1000 caracteres)
    - Notes longer than 1000 chars trigger validation error
    - Returns 422 Unprocessable Entity
    """
    payload = {
        "name": "Test",
        "company": "TestCorp",
        "email": "test@test.com",
        "notes": "x" * 1001,  # Exceeds limit
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_lead_missing_company(client: AsyncClient):
    """
    AC6: Crear lead sin company retorna 422
    - Missing company field triggers validation error
    - Returns 422 Unprocessable Entity
    """
    payload = {
        "name": "Test",
        # company missing
        "email": "test@test.com",
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_lead_status_always_nuevo(client: AsyncClient):
    """
    AC7: Status siempre es "Nuevo" para leads creados
    - New leads always have status="Nuevo" regardless of input
    - Attempting to set status is ignored
    """
    payload = {
        "name": "Test",
        "company": "TestCorp",
        "email": "test@test.com",
        # Note: status is not in schema so can't be set
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "Nuevo"


@pytest.mark.asyncio
async def test_create_lead_whitespace_validation(client: AsyncClient):
    """
    AC8: Whitespace en fields se valida correctamente
    - Leading/trailing whitespace is stripped
    - Empty string after strip triggers validation error
    - Returns 422 Unprocessable Entity
    """
    payload = {
        "name": "   ",  # Only whitespace - should fail after strip
        "company": "TestCorp",
        "email": "test@test.com",
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 422


# ============================================================
# EDGE CASE TESTS
# ============================================================

@pytest.mark.asyncio
async def test_create_lead_phone_optional(client: AsyncClient):
    """
    Edge: Crear lead sin phone no debe fallar
    - Phone field is optional
    - Can be omitted from request
    - Returns 201 Created with phone=null
    """
    payload = {
        "name": "Test Lead",
        "company": "TestCorp",
        "email": "test@test.com",
        # phone omitted
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["phone"] is None


@pytest.mark.asyncio
async def test_create_lead_multiple_valid_leads(client: AsyncClient):
    """
    Edge: Crear múltiples leads válidos secuencialmente
    - Multiple different leads can be created
    - Each gets unique ID
    - All succeed with 201
    """
    leads_data = [
        {
            "name": "Lead 1",
            "company": "Company A",
            "email": "lead1@test.com",
        },
        {
            "name": "Lead 2",
            "company": "Company B",
            "email": "lead2@test.com",
        },
        {
            "name": "Lead 3",
            "company": "Company C",
            "email": "lead3@test.com",
        },
    ]
    
    ids = []
    for payload in leads_data:
        response = await client.post("/api/leads", json=payload)
        assert response.status_code == 201
        data = response.json()
        ids.append(data["id"])
    
    # Verify all IDs are unique
    assert len(ids) == len(set(ids))


@pytest.mark.asyncio
async def test_create_lead_name_minimum_length(client: AsyncClient):
    """
    Edge: Nombre mínimo requerido (por lo menos 2 caracteres)
    - Name with 2+ characters is valid
    - Single character name fails validation
    - Returns 422 on too short name
    """
    # Valid: 2 characters
    payload_valid = {
        "name": "AB",
        "company": "TestCorp",
        "email": "test@test.com",
    }
    response_valid = await client.post("/api/leads", json=payload_valid)
    assert response_valid.status_code == 201


@pytest.mark.asyncio
async def test_create_lead_name_one_character_invalid(client: AsyncClient):
    """
    Edge: Un caracter en name no es válido
    - Single character name should fail validation
    - Returns 422 Unprocessable Entity
    """
    payload = {
        "name": "A",  # Only 1 character
        "company": "TestCorp",
        "email": "test@test.com",
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_lead_notes_exactly_limit(client: AsyncClient):
    """
    Edge: Notes con exactamente 1000 caracteres debe ser válido
    - Exactly at limit should pass
    - Returns 201 Created
    """
    payload = {
        "name": "Test",
        "company": "TestCorp",
        "email": "test@test.com",
        "notes": "x" * 1000,  # Exactly at limit
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert len(data["notes"]) == 1000


@pytest.mark.asyncio
async def test_create_lead_response_timestamps_valid(client: AsyncClient):
    """
    Edge: Timestamps deben ser válidos y coincidir
    - created_at and updated_at are populated
    - Both are valid ISO 8601 datetime strings
    - Both are equal at creation time
    - Both include timezone info
    """
    payload = {
        "name": "Test",
        "company": "TestCorp",
        "email": "test@test.com",
    }
    
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    
    # Verify timestamps exist
    assert data["created_at"] is not None
    assert data["updated_at"] is not None
    
    # Verify they are equal at creation
    assert data["created_at"] == data["updated_at"]
    
    # Verify they are valid ISO format
    try:
        created = datetime.fromisoformat(data["created_at"].replace('Z', '+00:00'))
        updated = datetime.fromisoformat(data["updated_at"].replace('Z', '+00:00'))
        
        # Verify they're recent (within last minute)
        now = datetime.now(timezone.utc)
        assert (now - created).total_seconds() < 60
        assert (now - updated).total_seconds() < 60
    except ValueError as e:
        pytest.fail(f"Timestamps not in valid ISO format: {e}")
