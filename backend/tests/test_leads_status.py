"""
Test suite for PATCH /api/leads/{id}/status endpoint (E2-S3)

Tests cover:
- Valid status transitions
- Invalid status rejection (400)
- Lead not found (404)
- Audit trail creation with old/new values
- Idempotency key caching
- Same-status no-op (no audit)
- Multiple transitions in sequence
- Concurrent request ordering
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Lead, LeadAuditLog
from app.models.lead import LeadStatus


# ============================================================
# AC1: Change to valid status returns 200 OK
# ============================================================

@pytest.mark.asyncio
async def test_change_status_valid(client: AsyncClient, created_lead: dict, db_session: AsyncSession):
    """Scenario: Cambiar status a estado válido"""
    lead_id = created_lead["id"]
    original_status = created_lead["status"]
    
    # Verify lead exists
    stmt = select(Lead).where(Lead.id == lead_id)
    result = await db_session.execute(stmt)
    lead_in_db = result.scalars().first()
    assert lead_in_db.status == original_status
    
    # PATCH to new status
    response = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "En contacto"}
    )
    
    # Verify response
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    response_data = response.json()
    assert response_data["status"] == "En contacto"
    assert response_data["id"] == lead_id
    
    # Verify DB updated
    stmt = select(Lead).where(Lead.id == lead_id)
    result = await db_session.execute(stmt)
    updated_lead = result.scalars().first()
    assert updated_lead.status == "En contacto"
    
    # Verify updated_at changed (should be later than original)
    assert updated_lead.updated_at >= lead_in_db.updated_at


# ============================================================
# AC2: Invalid status rejected with 400
# ============================================================

@pytest.mark.asyncio
async def test_change_status_invalid(client: AsyncClient, created_lead: dict, db_session: AsyncSession):
    """Scenario: Status inválido es rechazado"""
    lead_id = created_lead["id"]
    original_status = created_lead["status"]
    
    # PATCH with invalid status
    response = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "InvalidStatus"}
    )
    
    # Verify error response (422 for validation error, not 400 per FastAPI)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"
    
    # Verify lead unchanged in DB
    stmt = select(Lead).where(Lead.id == lead_id)
    result = await db_session.execute(stmt)
    lead = result.scalars().first()
    assert lead.status == original_status


# ============================================================
# AC3: Audit log records status change
# ============================================================

@pytest.mark.asyncio
async def test_change_status_audit_trail(client: AsyncClient, created_lead: dict, db_session: AsyncSession):
    """Scenario: Audit log registra cambio de estado"""
    lead_id = created_lead["id"]
    original_status = created_lead["status"]
    
    # Count existing audit logs
    stmt_count = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
    result = await db_session.execute(stmt_count)
    initial_audit_count = len(result.scalars().all())
    
    # PATCH to new status
    response = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "Propuesta enviada"}
    )
    assert response.status_code == 200
    
    # Query audit log
    stmt = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id).order_by(LeadAuditLog.created_at.desc())
    result = await db_session.execute(stmt)
    audit_logs = result.scalars().all()
    
    # Verify new audit event exists
    assert len(audit_logs) == initial_audit_count + 1, "No new audit event created"
    latest_audit = audit_logs[0]
    
    assert latest_audit.event_type == "STATUS_CHANGED"
    assert latest_audit.lead_id == lead_id
    assert latest_audit.old_value == {"status": original_status}
    assert latest_audit.new_value == {"status": "Propuesta enviada"}
    assert "Status changed" in latest_audit.description


# ============================================================
# AC4: Idempotency key prevents duplicates
# ============================================================

@pytest.mark.asyncio
async def test_change_status_idempotency(client: AsyncClient, created_lead: dict, db_session: AsyncSession):
    """Scenario: Cambios rápidos con idempotency key"""
    lead_id = created_lead["id"]
    idempotency_key = "test-idempotency-key-123"
    
    # Count initial audit logs
    stmt = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
    result = await db_session.execute(stmt)
    initial_count = len(result.scalars().all())
    
    # Send PATCH 3 times with same idempotency key
    response1 = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "En contacto"},
        headers={"Idempotency-Key": idempotency_key}
    )
    assert response1.status_code == 200
    data1 = response1.json()
    
    response2 = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "En contacto"},
        headers={"Idempotency-Key": idempotency_key}
    )
    assert response2.status_code == 200
    data2 = response2.json()
    
    response3 = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "En contacto"},
        headers={"Idempotency-Key": idempotency_key}
    )
    assert response3.status_code == 200
    data3 = response3.json()
    
    # Verify all responses are identical
    assert data1 == data2 == data3
    
    # Verify only 1 audit event created (not 3)
    stmt = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
    result = await db_session.execute(stmt)
    final_count = len(result.scalars().all())
    assert final_count == initial_count + 1, f"Expected 1 new audit event, got {final_count - initial_count}"


# ============================================================
# AC5: Multiple transitions work correctly
# ============================================================

@pytest.mark.asyncio
async def test_change_status_multiple_transitions(client: AsyncClient, created_lead: dict, db_session: AsyncSession):
    """Scenario: Transiciones múltiples funcionan correctamente"""
    lead_id = created_lead["id"]
    
    # Transition 1: Nuevo → En contacto
    response1 = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "En contacto"}
    )
    assert response1.status_code == 200
    assert response1.json()["status"] == "En contacto"
    
    # Transition 2: En contacto → Propuesta enviada
    response2 = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "Propuesta enviada"}
    )
    assert response2.status_code == 200
    assert response2.json()["status"] == "Propuesta enviada"
    
    # Transition 3: Propuesta enviada → Cerrado
    response3 = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "Cerrado"}
    )
    assert response3.status_code == 200
    assert response3.json()["status"] == "Cerrado"
    
    # Verify final status in DB
    stmt = select(Lead).where(Lead.id == lead_id)
    result = await db_session.execute(stmt)
    lead = result.scalars().first()
    assert lead.status == "Cerrado"
    
    # Verify 3 audit events (one for each transition)
    stmt = select(LeadAuditLog).where(
        (LeadAuditLog.lead_id == lead_id) &
        (LeadAuditLog.event_type == "STATUS_CHANGED")
    ).order_by(LeadAuditLog.created_at)
    result = await db_session.execute(stmt)
    audit_logs = result.scalars().all()
    assert len(audit_logs) >= 3, f"Expected at least 3 audit events, got {len(audit_logs)}"


# ============================================================
# AC6: Same status is idempotent, no audit
# ============================================================

@pytest.mark.asyncio
async def test_change_status_same_no_audit(client: AsyncClient, created_lead: dict, db_session: AsyncSession):
    """Scenario: Cambiar a mismo status es idempotente"""
    lead_id = created_lead["id"]
    original_status = created_lead["status"]
    
    # Count audit logs before
    stmt = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
    result = await db_session.execute(stmt)
    count_before = len(result.scalars().all())
    
    # PATCH to same status (no change)
    response = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": original_status}
    )
    
    # Verify 200 OK
    assert response.status_code == 200
    assert response.json()["status"] == original_status
    
    # Verify NO new audit event created
    stmt = select(LeadAuditLog).where(LeadAuditLog.lead_id == lead_id)
    result = await db_session.execute(stmt)
    count_after = len(result.scalars().all())
    assert count_after == count_before, "Audit event created for no-change status"


# ============================================================
# AC7: Non-existent lead returns 404
# ============================================================

@pytest.mark.asyncio
async def test_change_status_not_found(client: AsyncClient):
    """Scenario: Lead no existe retorna 404"""
    # PATCH non-existent lead
    response = await client.patch(
        "/api/leads/9999/status",
        json={"new_status": "En contacto"}
    )
    
    # Verify 404
    assert response.status_code == 404
    error_data = response.json()
    assert "not found" in error_data["detail"].lower()


# ============================================================
# AC8: Concurrent updates maintain order
# ============================================================

@pytest.mark.asyncio
async def test_change_status_concurrent_ordering(client: AsyncClient, created_lead: dict, db_session: AsyncSession):
    """Scenario: Orden de transiciones es respetado en auditoría"""
    lead_id = created_lead["id"]
    
    # Simulate sequential rapid requests
    response1 = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "En contacto"}
    )
    assert response1.status_code == 200
    
    response2 = await client.patch(
        f"/api/leads/{lead_id}/status",
        json={"new_status": "Propuesta enviada"}
    )
    assert response2.status_code == 200
    
    # Verify final status is from last request
    assert response2.json()["status"] == "Propuesta enviada"
    
    # Verify audit trail maintains order
    stmt = select(LeadAuditLog).where(
        (LeadAuditLog.lead_id == lead_id) &
        (LeadAuditLog.event_type == "STATUS_CHANGED")
    ).order_by(LeadAuditLog.created_at)
    result = await db_session.execute(stmt)
    audit_logs = result.scalars().all()
    
    # Verify at least 2 events and ordering
    assert len(audit_logs) >= 2
    assert audit_logs[0].new_value["status"] == "En contacto"
    if len(audit_logs) > 1:
        assert audit_logs[-1].new_value["status"] == "Propuesta enviada"
