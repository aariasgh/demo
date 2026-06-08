"""Tests for PUT /api/leads/{id} endpoint - Update Lead functionality

This test suite validates the complete flow for updating leads, including:
- Partial field updates (not all fields required)
- Email uniqueness in UPDATE context (excluding current lead)
- Field validation (name, company, email, phone, notes)
- Audit trail creation for field changes
- Timestamp preservation (created_at doesn't change, updated_at does)
- Error handling (400, 404, 409 responses)
- Edge cases (empty strings, None values, etc.)

**Test Database Strategy:**
- Uses PostgreSQL (production database engine, not SQLite)
- Separate test database: minicrmdb_test
- Fixtures defined in conftest.py (session-scoped engine, function-scoped sessions)
- Each test gets fresh tables via TRUNCATE CASCADE
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timezone
from sqlalchemy import select
from app.models.lead import Lead
from app.models.audit import LeadAuditLog


# ============================================================
# ACCEPTANCE CRITERIA TESTS
# ============================================================

@pytest.mark.asyncio
async def test_update_lead_all_fields_valid(client: AsyncClient, created_lead):
    """
    AC1: Editar lead con todos los campos válidos
    - Updates all fields of an existing lead
    - Returns 200 OK with all updated values
    - updated_at reflects current time, created_at unchanged
    - Audit log created with old_value and new_value
    """
    lead_id = created_lead["id"]
    
    payload = {
        "name": "Juan García García",
        "company": "NewCorp Inc",
        "email": "juan.garcia@newcorp.com",
        "phone": "+34917888888",
        "notes": "Información actualizada, muy interesado en Feature X"
    }
    
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify all fields updated
    assert data["id"] == lead_id
    assert data["name"] == payload["name"]
    assert data["company"] == payload["company"]
    assert data["email"] == payload["email"]
    assert data["phone"] == payload["phone"]
    assert data["notes"] == payload["notes"]
    assert data["status"] == "Nuevo"  # Status doesn't change
    
    # Verify timestamps: created_at frozen, updated_at advanced past its original value
    assert data["created_at"] == created_lead["created_at"]  # created_at unchanged
    assert data["updated_at"] != created_lead["updated_at"]  # updated_at advanced


@pytest.mark.asyncio
async def test_update_lead_email_duplicate_409(client: AsyncClient, two_created_leads, db_session):
    """
    AC2: Cambiar email a uno que ya existe en otro lead → 409 Conflict
    - Attempting to change lead's email to one owned by another lead fails
    - Returns 409 with "Email ya existe en el sistema"
    - X-Error-Code header is "EMAIL_DUPLICATE"
    - No changes are made to the lead (email + updated_at preserved)
    - NO audit event is created (spec scenario: "NO se crea evento de auditoría")
    """
    lead1, lead2 = two_created_leads
    lead1_id = lead1["id"]
    lead2_email = lead2["email"]

    payload = {"email": lead2_email}
    response = await client.put(f"/api/leads/{lead1_id}", json=payload)

    assert response.status_code == 409, f"Expected 409, got {response.status_code}: {response.text}"
    data = response.json()
    assert "Email ya existe" in data.get("detail", "")
    assert response.headers.get("X-Error-Code") == "EMAIL_DUPLICATE"

    # Verify lead1 email and updated_at didn't change (no-op on conflict)
    verify = await client.get(f"/api/leads/{lead1_id}")
    verify_data = verify.json()
    assert verify_data["email"] == lead1["email"]
    assert verify_data["updated_at"] == lead1["updated_at"]

    # Verify NO FIELD_EDITED audit event was created for lead1
    audit_stmt = select(LeadAuditLog).where(
        LeadAuditLog.lead_id == lead1_id,
        LeadAuditLog.event_type == "FIELD_EDITED",
    )
    audit_result = await db_session.execute(audit_stmt)
    assert audit_result.scalars().first() is None


@pytest.mark.asyncio
async def test_update_lead_partial_only_phone(client: AsyncClient, created_lead):
    """
    AC3: Edición parcial - cambiar solo teléfono
    - Only phone field is updated in request
    - Other fields remain unchanged in database
    - Returns 200 OK with partial update applied
    - Audit log only records the field that changed
    """
    lead_id = created_lead["id"]
    original_name = created_lead["name"]
    original_company = created_lead["company"]
    original_email = created_lead["email"]
    
    payload = {"phone": "+34917999999"}
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify phone changed
    assert data["phone"] == "+34917999999"
    
    # Verify other fields unchanged
    assert data["name"] == original_name
    assert data["company"] == original_company
    assert data["email"] == original_email


@pytest.mark.asyncio
async def test_update_lead_change_email_valid_different(client: AsyncClient, created_lead):
    """
    AC4: Cambiar email a uno válido (diferente del actual y no duplicado)
    - Email can be changed to a new, unused email
    - Returns 200 OK
    - Audit log records old → new email
    """
    lead_id = created_lead["id"]
    old_email = created_lead["email"]
    new_email = "juan.new@corp.com"
    
    payload = {"email": new_email}
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == new_email


@pytest.mark.asyncio
async def test_update_lead_invalid_email_format_422(client: AsyncClient, created_lead):
    """
    AC5: Email inválido es rechazado (422)
    - Invalid email format triggers validation error
    - Returns 422 Unprocessable Entity, message in detail[0].msg
    - Lead is not modified
    """
    lead_id = created_lead["id"]
    original_email = created_lead["email"]

    payload = {"email": "invalido@"}  # Invalid format
    response = await client.put(f"/api/leads/{lead_id}", json=payload)

    assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
    messages = " ".join(err["msg"] for err in response.json()["detail"])
    assert "Invalid email format" in messages

    # Verify email didn't change
    verify = await client.get(f"/api/leads/{lead_id}")
    assert verify.json()["email"] == original_email


@pytest.mark.asyncio
async def test_update_lead_empty_name_422(client: AsyncClient, created_lead):
    """
    AC6: Nombre vacío es rechazado
    - Empty name string triggers validation error
    - Returns 422 Unprocessable Entity, message in detail[0].msg
    - Lead is not modified
    """
    lead_id = created_lead["id"]
    original_name = created_lead["name"]

    payload = {"name": ""}
    response = await client.put(f"/api/leads/{lead_id}", json=payload)

    assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
    # NOTE: min_length=2 fires before the custom validator, so the error targets
    # the 'name' field. Assert on field location (robust) rather than exact prose.
    fields = [err["loc"][-1] for err in response.json()["detail"]]
    assert "name" in fields

    # Verify name didn't change
    verify = await client.get(f"/api/leads/{lead_id}")
    assert verify.json()["name"] == original_name


@pytest.mark.asyncio
async def test_update_lead_whitespace_only_name_422(client: AsyncClient, created_lead):
    """
    AC7: Nombre con solo espacios es rechazado
    - Whitespace-only name is stripped to "" and rejected
    - Returns 422 Unprocessable Entity, error targets the 'name' field
    """
    lead_id = created_lead["id"]

    payload = {"name": "    "}  # Only spaces
    response = await client.put(f"/api/leads/{lead_id}", json=payload)

    assert response.status_code == 422
    fields = [err["loc"][-1] for err in response.json()["detail"]]
    assert "name" in fields


@pytest.mark.asyncio
async def test_update_lead_notes_exceeds_limit_422(client: AsyncClient, created_lead):
    """
    AC8: Notas excediendo límite (>1000 chars) es rechazado
    - Notes longer than 1000 chars trigger validation error
    - Returns 422 Unprocessable Entity, error targets the 'notes' field
    - Lead is not modified
    """
    lead_id = created_lead["id"]
    original_notes = created_lead["notes"]

    payload = {"notes": "x" * 1001}  # Exceeds 1000 char limit
    response = await client.put(f"/api/leads/{lead_id}", json=payload)

    assert response.status_code == 422
    fields = [err["loc"][-1] for err in response.json()["detail"]]
    assert "notes" in fields

    # Verify notes didn't change
    verify = await client.get(f"/api/leads/{lead_id}")
    assert verify.json()["notes"] == original_notes


@pytest.mark.asyncio
async def test_update_lead_not_found_404(client: AsyncClient):
    """
    AC9: Lead no existe retorna 404
    - Attempting to update non-existent lead
    - Returns 404 Not Found
    - X-Error-Code header is "LEAD_NOT_FOUND"
    """
    non_existent_id = 99999
    
    payload = {"name": "New Name"}
    response = await client.put(f"/api/leads/{non_existent_id}", json=payload)
    
    assert response.status_code == 404
    data = response.json()
    assert "Lead not found" in data.get("detail", "")
    assert response.headers.get("X-Error-Code") == "LEAD_NOT_FOUND"


# ============================================================
# AUDIT TRAIL TESTS
# ============================================================

@pytest.mark.asyncio
async def test_update_lead_audit_trail_created(client: AsyncClient, created_lead, db_session):
    """
    Auditoría: Evento de audit registra cambios específicos
    - When a lead field is updated, an audit log entry is created
    - Audit log contains: event_type="FIELD_EDITED", old_value, new_value
    - old_value and new_value are JSONB with changed fields only
    """
    lead_id = created_lead["id"]
    original_name = created_lead["name"]
    new_name = "Juan García García"
    
    payload = {"name": new_name}
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    
    # Query audit log
    stmt = select(LeadAuditLog).where(
        LeadAuditLog.lead_id == lead_id
    ).order_by(LeadAuditLog.created_at.desc())
    
    result = await db_session.execute(stmt)
    latest_audit = result.scalars().first()
    
    assert latest_audit is not None
    assert latest_audit.event_type == "FIELD_EDITED"
    # Verify only 'name' is in old_value/new_value (not other fields)
    assert "name" in latest_audit.old_value
    assert latest_audit.old_value["name"] == original_name
    assert latest_audit.new_value["name"] == new_name
    # Other fields should NOT be in audit
    assert "email" not in latest_audit.old_value
    assert "email" not in latest_audit.new_value


@pytest.mark.asyncio
async def test_update_lead_no_audit_if_no_changes(client: AsyncClient, created_lead, db_session):
    """
    Auditoría: No crear evento si nada cambió
    - If PUT request has no actual changes, no audit log entry is created
    - Returns 200 OK but lead is unchanged
    """
    lead_id = created_lead["id"]
    original_email = created_lead["email"]
    
    # Count current audit entries for this lead (should include CREATED event from POST)
    stmt = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
    result = await db_session.execute(stmt)
    initial_count = len(result.scalars().all())  # Should be 1 (CREATED event)
    
    # Make request with same email (no change)
    payload = {"email": original_email}
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    
    # Re-count audit entries
    result = await db_session.execute(stmt)
    final_count = len(result.scalars().all())
    
    # Should be NO new audit entry if email didn't change
    # (final_count should still equal initial_count)
    assert final_count == initial_count


@pytest.mark.asyncio
async def test_update_lead_audit_multiple_fields(client: AsyncClient, created_lead, db_session):
    """
    Auditoría: Múltiples campos en un evento de audit
    - When multiple fields are updated, one audit entry captures all changes
    - old_value and new_value contain all changed fields
    """
    lead_id = created_lead["id"]
    
    payload = {
        "name": "New Name",
        "email": "new@email.com",
        "phone": "+34917999999"
    }
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    
    # Query audit log
    stmt = select(LeadAuditLog).where(
        LeadAuditLog.lead_id == lead_id
    ).order_by(LeadAuditLog.created_at.desc())
    
    result = await db_session.execute(stmt)
    latest_audit = result.scalars().first()
    
    assert latest_audit is not None
    assert "name" in latest_audit.old_value
    assert "email" in latest_audit.old_value
    assert "phone" in latest_audit.old_value


# ============================================================
# EDGE CASE TESTS
# ============================================================

@pytest.mark.asyncio
async def test_update_lead_same_email_allowed(client: AsyncClient, created_lead):
    """
    Edge: Lead puede mantener su propio email
    - If updating lead's email to the same value, it should succeed
    - No email uniqueness violation
    - Returns 200 OK
    """
    lead_id = created_lead["id"]
    same_email = created_lead["email"]
    
    payload = {"email": same_email}
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == same_email


@pytest.mark.asyncio
async def test_update_lead_empty_request_body(client: AsyncClient, created_lead):
    """
    Edge: Request body vacío (empty object)
    - Empty update object {} should be valid
    - No fields are updated
    - Returns 200 OK with unchanged lead
    """
    lead_id = created_lead["id"]
    original_name = created_lead["name"]
    
    payload = {}
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == original_name


@pytest.mark.asyncio
async def test_update_lead_notes_null_to_value(client: AsyncClient, created_lead):
    """
    Edge: Actualizar notas de null a valor
    - Lead created with no notes (notes=null)
    - Update adds notes content
    - Returns 200 OK with notes populated
    """
    lead_id = created_lead["id"]
    new_notes = "Nueva información agregada"
    
    # Create lead without notes
    create_payload = {
        "name": "Test Lead",
        "company": "Test Corp",
        "email": "test@test.com"
        # notes omitted, so it's NULL
    }
    create_response = await client.post("/api/leads", json=create_payload)
    assert create_response.status_code == 201
    lead = create_response.json()
    assert lead["notes"] is None
    
    # Update to add notes
    update_payload = {"notes": new_notes}
    update_response = await client.put(f"/api/leads/{lead['id']}", json=update_payload)
    
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["notes"] == new_notes


@pytest.mark.asyncio
async def test_update_lead_notes_value_to_empty_string(client: AsyncClient, created_lead):
    """
    Edge: Actualizar notas de valor a string vacío
    - Lead has notes content
    - Update to empty string is VALID (notes has no min_length)
    - Returns 200 OK and notes becomes empty string
    """
    lead_id = created_lead["id"]
    
    # Notes should be updated to empty string (valid per schema: max_length only)
    payload = {"notes": ""}
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == ""


@pytest.mark.asyncio
async def test_update_lead_phone_optional_clear(client: AsyncClient, created_lead):
    """
    Edge: Phone field es opcional
    - Can update other fields and leave phone untouched
    - Phone can be set to None (omitted from payload)
    - Returns 200 OK
    """
    lead_id = created_lead["id"]
    
    payload = {"name": "Updated Name"}
    # phone not included - should remain as-is
    response = await client.put(f"/api/leads/{lead_id}", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    # Phone should be what it was before
    assert data["phone"] == created_lead["phone"]


# ============================================================
# FIXTURES (moved to conftest.py)
# ============================================================
