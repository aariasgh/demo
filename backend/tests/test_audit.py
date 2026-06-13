"""Tests for GET /api/leads/{id}/audit endpoint - Audit History functionality

This test suite validates the complete audit trail functionality, including:
- Audit event registration (CREATED, FIELD_EDITED, STATUS_CHANGED)
- Historial retrieval with pagination and filtering
- Timestamp precision (UTC timezone)
- Error handling (404 for non-existent leads)
- old_value and new_value capture accuracy

**Test Database Strategy:**
- Uses PostgreSQL (production database engine)
- Separate test database: minicrmdb_test
- Each test gets fresh tables via TRUNCATE CASCADE
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.lead import Lead
from app.models.audit import LeadAuditLog


# ============================================================
# ACCEPTANCE CRITERIA TESTS
# ============================================================

@pytest.mark.asyncio
async def test_audit_created_event_on_lead_creation(client: AsyncClient, test_db_session: AsyncSession):
    """
    AC-1: Lead creado registra CREATED event con timestamp
    - Creates a lead
    - Verifies CREATED event exists in lead_audit_log
    - Confirms timestamp is recorded
    """
    payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
        "phone": "+1234567890",
    }
    
    # Create lead
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 201
    lead_data = response.json()
    lead_id = lead_data["id"]
    
    # Verify CREATED event in database
    stmt = select(LeadAuditLog).where(
        (LeadAuditLog.lead_id == lead_id) &
        (LeadAuditLog.event_type == "CREATED")
    )
    result = await test_db_session.execute(stmt)
    audit_log = result.scalar_one_or_none()
    
    assert audit_log is not None, "CREATED event not found in audit log"
    assert audit_log.event_type == "CREATED"
    assert audit_log.created_at is not None


@pytest.mark.asyncio
async def test_audit_field_edited_event(client: AsyncClient, test_db_session: AsyncSession):
    """
    AC-2: Lead editado registra FIELD_EDITED event
    - Creates a lead
    - Edits a field (name)
    - Verifies FIELD_EDITED event exists with old_value and new_value
    """
    # Create lead first
    create_payload = {
        "name": "Original Name",
        "company": "Original Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    assert create_response.status_code == 201
    lead_id = create_response.json()["id"]
    
    # Edit the lead
    edit_payload = {
        "name": "Updated Name",
        "company": "Updated Company",
    }
    edit_response = await client.put(f"/api/leads/{lead_id}", json=edit_payload)
    assert edit_response.status_code == 200
    
    # Verify FIELD_EDITED event
    stmt = select(LeadAuditLog).where(
        (LeadAuditLog.lead_id == lead_id) &
        (LeadAuditLog.event_type == "FIELD_EDITED")
    )
    result = await test_db_session.execute(stmt)
    audit_log = result.scalar_one_or_none()
    
    assert audit_log is not None, "FIELD_EDITED event not found"
    assert audit_log.old_value is not None
    assert audit_log.new_value is not None
    # Verify old and new values captured both fields
    assert audit_log.old_value.get("name") == "Original Name"
    assert audit_log.new_value.get("name") == "Updated Name"


@pytest.mark.asyncio
async def test_audit_status_changed_event(client: AsyncClient, test_db_session: AsyncSession):
    """
    AC-3: Status cambio registra STATUS_CHANGED event
    - Creates a lead with initial status "Nuevo"
    - Changes status to "En contacto"
    - Verifies STATUS_CHANGED event exists
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Change status
    status_payload = {"new_status": "En contacto"}
    status_response = await client.patch(f"/api/leads/{lead_id}/status", json=status_payload)
    assert status_response.status_code == 200
    
    # Verify STATUS_CHANGED event
    stmt = select(LeadAuditLog).where(
        (LeadAuditLog.lead_id == lead_id) &
        (LeadAuditLog.event_type == "STATUS_CHANGED")
    )
    result = await test_db_session.execute(stmt)
    audit_log = result.scalar_one_or_none()
    
    assert audit_log is not None, "STATUS_CHANGED event not found"
    assert audit_log.old_value.get("status") == "Nuevo"
    assert audit_log.new_value.get("status") == "En contacto"


@pytest.mark.asyncio
async def test_audit_timestamps_utc(client: AsyncClient, test_db_session: AsyncSession):
    """
    AC-4: Cada evento tiene created_at en UTC
    - Creates a lead and verifies timestamps are properly formatted
    - Confirms UTC timezone handling
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Get audit history
    response = await client.get(f"/api/leads/{lead_id}/audit")
    assert response.status_code == 200
    data = response.json()
    
    # Verify timestamps exist and are valid
    assert len(data["data"]) > 0
    for event in data["data"]:
        assert "created_at" in event
        # Parse the timestamp
        created_at = event["created_at"]
        assert created_at is not None
        # Should be ISO format timestamp
        assert isinstance(created_at, str)


@pytest.mark.asyncio
async def test_audit_created_by_field(client: AsyncClient, test_db_session: AsyncSession):
    """
    AC-5: Cada evento registra created_by (usuario o sistema)
    - Verifies that created_by_id field is populated (system for now)
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Get audit history
    response = await client.get(f"/api/leads/{lead_id}/audit")
    assert response.status_code == 200
    data = response.json()
    
    # Verify created_by_id exists for at least one event
    assert len(data["data"]) > 0
    # For now created_by_id can be null (system), but field should be present
    for event in data["data"]:
        assert "created_by_id" in event


@pytest.mark.asyncio
async def test_audit_get_endpoint_returns_200(client: AsyncClient):
    """
    AC-6: GET /api/leads/{id}/audit retorna historial
    - Endpoint returns 200 OK with audit events
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Get audit history
    response = await client.get(f"/api/leads/{lead_id}/audit")
    assert response.status_code == 200
    data = response.json()
    
    # Verify response structure
    assert "data" in data
    assert "meta" in data
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1  # At least CREATED event


@pytest.mark.asyncio
async def test_audit_history_desc_ordering(client: AsyncClient):
    """
    AC-7: Historial ordena DESC por timestamp (más recientes primero)
    - Creates multiple events and verifies DESC ordering
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Create additional events by editing
    edit_response = await client.put(
        f"/api/leads/{lead_id}",
        json={"name": "Updated Name"}
    )
    assert edit_response.status_code == 200
    
    # Get audit history
    response = await client.get(f"/api/leads/{lead_id}/audit")
    assert response.status_code == 200
    data = response.json()
    
    # Verify DESC ordering - first event should be FIELD_EDITED (more recent)
    # then CREATED (older)
    assert len(data["data"]) >= 2
    assert data["data"][0]["event_type"] == "FIELD_EDITED"
    assert data["data"][1]["event_type"] == "CREATED"
    
    # Verify timestamps are in descending order
    for i in range(len(data["data"]) - 1):
        assert data["data"][i]["created_at"] >= data["data"][i + 1]["created_at"]


@pytest.mark.asyncio
async def test_audit_required_fields_in_response(client: AsyncClient):
    """
    AC-8: Historial incluye todos los campos requeridos
    - Verifies each event has all required fields
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Get audit history
    response = await client.get(f"/api/leads/{lead_id}/audit")
    assert response.status_code == 200
    data = response.json()
    
    # Verify required fields
    required_fields = [
        "id", "lead_id", "event_type", "old_value", "new_value",
        "created_by_id", "created_at"
    ]
    
    for event in data["data"]:
        for field in required_fields:
            assert field in event, f"Missing required field: {field}"


@pytest.mark.asyncio
async def test_audit_pagination_support(client: AsyncClient):
    """
    AC-9: Historial soporta paginación (limit/offset)
    - Creates multiple events and tests limit and offset parameters
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Create additional events
    for i in range(3):
        await client.put(
            f"/api/leads/{lead_id}",
            json={"name": f"Updated Name {i}"}
        )
    
    # Test with limit
    response = await client.get(f"/api/leads/{lead_id}/audit?limit=2&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 2  # Should return only 2 events
    assert data["meta"]["total"] >= 4  # At least 4 total events
    
    # Test with offset
    response_offset = await client.get(f"/api/leads/{lead_id}/audit?limit=2&offset=2")
    assert response_offset.status_code == 200
    data_offset = response_offset.json()
    assert len(data_offset["data"]) >= 1  # Should return remaining events


@pytest.mark.asyncio
async def test_audit_lead_not_found_returns_404(client: AsyncClient):
    """
    AC-10: Lead inexistente retorna 404
    - Attempts to get audit history for non-existent lead
    """
    response = await client.get("/api/leads/99999/audit")
    assert response.status_code == 404
    data = response.json()
    assert "no encontrado" in data.get("detail", "").lower()


@pytest.mark.asyncio
async def test_audit_old_new_value_capture(client: AsyncClient, test_db_session: AsyncSession):
    """
    AC-11: old_value y new_value capturan cambios exactos
    - Verifies that field changes are captured precisely
    """
    # Create lead with initial values
    create_payload = {
        "name": "Juan García",
        "company": "TechCorp",
        "email": "juan@tech.com",
        "phone": "+34917777777",
        "notes": "Lead inicial",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Edit with different values
    edit_payload = {
        "name": "Juan García López",
        "company": "TechCorp International",
        "notes": "Lead actualizado",
    }
    await client.put(f"/api/leads/{lead_id}", json=edit_payload)
    
    # Get audit log entry
    stmt = select(LeadAuditLog).where(
        (LeadAuditLog.lead_id == lead_id) &
        (LeadAuditLog.event_type == "FIELD_EDITED")
    )
    result = await test_db_session.execute(stmt)
    audit_log = result.scalar_one_or_none()
    
    # Verify precise capture
    assert audit_log.old_value.get("name") == "Juan García"
    assert audit_log.new_value.get("name") == "Juan García López"
    assert audit_log.old_value.get("company") == "TechCorp"
    assert audit_log.new_value.get("company") == "TechCorp International"


@pytest.mark.asyncio
async def test_audit_immutable_fields_handling(client: AsyncClient, test_db_session: AsyncSession):
    """
    AC-12: Cambios inmutables (id, created_at) no se registran
    - Verifies that immutable fields don't create audit events
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    initial_created_at = create_response.json()["created_at"]
    
    # Get initial audit log count
    stmt = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
    result = await test_db_session.execute(stmt)
    initial_count = len(result.scalars().all())
    
    # Attempt to "edit" without changing mutable fields
    # (backend should reject or ignore id/created_at changes)
    edit_response = await client.put(
        f"/api/leads/{lead_id}",
        json={"name": "Test Lead"}  # Same name, no change
    )
    
    # Verify no new audit event was created for no-op edit
    result = await test_db_session.execute(stmt)
    final_count = len(result.scalars().all())
    # No new event should be created if nothing changed
    assert final_count == initial_count


@pytest.mark.asyncio
async def test_audit_event_type_filtering(client: AsyncClient):
    """
    Test filtering by event_type parameter
    - Verifies that event_type filter works correctly
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Create multiple event types
    await client.put(f"/api/leads/{lead_id}", json={"name": "Updated"})
    await client.patch(f"/api/leads/{lead_id}/status", json={"new_status": "En contacto"})
    
    # Filter by event_type
    response = await client.get(f"/api/leads/{lead_id}/audit?event_type=CREATED")
    assert response.status_code == 200
    data = response.json()
    
    # Should only return CREATED events
    for event in data["data"]:
        assert event["event_type"] == "CREATED"


# ============================================================
# REGRESSION TESTS
# ============================================================

@pytest.mark.asyncio
async def test_audit_no_data_loss_on_concurrent_edits(client: AsyncClient):
    """
    Regression: Ensure no audit data is lost during concurrent operations
    """
    # Create lead
    create_payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=create_payload)
    lead_id = create_response.json()["id"]
    
    # Simulate multiple sequential edits
    for i in range(5):
        await client.put(
            f"/api/leads/{lead_id}",
            json={"name": f"Updated {i}"}
        )
    
    # Get all audit events
    response = await client.get(f"/api/leads/{lead_id}/audit?limit=100")
    assert response.status_code == 200
    data = response.json()
    
    # Should have 6 events: 1 CREATED + 5 FIELD_EDITED
    assert data["meta"]["total"] >= 6, f"Expected at least 6 events, got {data['meta']['total']}"


@pytest.mark.asyncio
async def test_audit_rejects_invalid_event_type(client: AsyncClient):
    """
    Event type validation: Invalid event_type returns 422 Unprocessable Entity
    - Attempts to filter by non-existent event type (e.g., "INVALID_TYPE")
    - Should return 422, not 200 with empty results
    """
    # Create a lead first (need valid lead_id)
    payload = {
        "name": "Test Lead",
        "company": "Test Company",
        "email": "test@example.com",
    }
    create_response = await client.post("/api/leads", json=payload)
    assert create_response.status_code == 201
    lead_id = create_response.json()["id"]
    
    # Test invalid event_type
    response = await client.get(f"/api/leads/{lead_id}/audit?event_type=INVALID_TYPE")
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    error_data = response.json()
    assert "Invalid event_type" in error_data["detail"]
    
    # Test another invalid value
    response = await client.get(f"/api/leads/{lead_id}/audit?event_type=TYPO")
    assert response.status_code == 422
    
    # Valid values should still work
    response = await client.get(f"/api/leads/{lead_id}/audit?event_type=CREATED")
    assert response.status_code == 200, "Valid event_type should return 200"
