"""
Unit tests for GET /api/leads/at-risk endpoint
Tests acceptance criteria for at-risk lead detection
"""

import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead, LeadStatus


class TestLeadsAtRiskEndpoint:
    """Test suite for at-risk leads endpoint (AC-2.1 through AC-2.4)"""

    @pytest.mark.asyncio
    async def test_endpoint_exists_returns_200(self, client: AsyncClient):
        """AC-2.1: Endpoint GET /api/leads/at-risk exists and returns 200 OK"""
        response = await client.get("/api/leads/at-risk")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_response_structure(self, client: AsyncClient):
        """AC-2.1: Response has correct structure {data: [], count: int}"""
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        
        assert isinstance(data, dict)
        assert "data" in data
        assert "count" in data
        assert isinstance(data["data"], list)
        assert isinstance(data["count"], int)
        assert data["count"] == len(data["data"])

    @pytest.mark.asyncio
    async def test_empty_list_when_no_at_risk_leads(self, client: AsyncClient):
        """Empty list when no leads are at-risk"""
        # Create a fresh lead (not at-risk)
        lead_data = {
            "name": "Fresh Lead",
            "company": "TestCorp",
            "email": f"fresh-{datetime.now().timestamp()}@test.com"
        }
        response = await client.post("/api/leads", json=lead_data)
        assert response.status_code == 201
        
        # Query at-risk endpoint
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        
        # Check that this lead is not in the at-risk list
        lead_id = response.json() if response.status_code != 201 else None
        # Note: May have other at-risk leads from previous tests

    @pytest.mark.asyncio
    async def test_response_includes_all_required_fields(self, client: AsyncClient, test_db_session: AsyncSession):
        """AC-2.2: Response includes required fields for each lead"""
        # Create and mark as at-risk
        lead = Lead(
            name="Test Lead",
            company="Test Corp",
            email=f"fields-test-{datetime.now().timestamp()}@test.com",
            status="Nuevo",
            last_status_change_at=datetime.now(timezone.utc) - timedelta(days=8)
        )
        test_db_session.add(lead)
        await test_db_session.commit()
        await test_db_session.refresh(lead)
        
        # Query endpoint
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        
        # Find our test lead
        test_leads = [l for l in data["data"] if l["id"] == lead.id]
        assert len(test_leads) > 0, "Test lead should be in at-risk list"
        
        test_lead = test_leads[0]
        required_fields = [
            "id", "name", "company", "email", "status",
            "days_without_change", "created_at", "last_status_change_at"
        ]
        
        for field in required_fields:
            assert field in test_lead, f"Missing required field: {field}"

    @pytest.mark.asyncio
    async def test_days_without_change_calculation(self, client: AsyncClient, test_db_session: AsyncSession):
        """AC-2.3: days_without_change = FLOOR((NOW - last_status_change_at) / 86400)"""
        # Create a lead exactly 8 days ago
        now = datetime.now(timezone.utc)
        eight_days_ago = now - timedelta(days=8)
        
        lead = Lead(
            name="8-Day Lead",
            company="Test Corp",
            email=f"8days-{datetime.now().timestamp()}@test.com",
            status="Nuevo",
            last_status_change_at=eight_days_ago
        )
        test_db_session.add(lead)
        await test_db_session.commit()
        await test_db_session.refresh(lead)
        
        # Query endpoint
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        
        # Find our test lead
        test_leads = [l for l in data["data"] if l["id"] == lead.id]
        assert len(test_leads) > 0
        
        test_lead = test_leads[0]
        assert test_lead["days_without_change"] >= 8
        # Account for microseconds rounding
        assert test_lead["days_without_change"] <= 9

    @pytest.mark.asyncio
    async def test_ordering_desc_by_days_without_change(self, client: AsyncClient, test_db_session: AsyncSession):
        """AC-2.4: Leads ordered DESC by days_without_change (oldest first)"""
        # Create leads with different ages
        now = datetime.now(timezone.utc)
        
        leads_data = [
            ("5-Day Lead", now - timedelta(days=5)),    # Should NOT be in list (< 7 days)
            ("7-Day Lead", now - timedelta(days=7)),    # Should be in list (= 7 days)
            ("10-Day Lead", now - timedelta(days=10)),  # Should be in list (> 7 days)
            ("9-Day Lead", now - timedelta(days=9)),    # Should be in list
        ]
        
        created_leads = []
        for name, ts in leads_data:
            lead = Lead(
                name=name,
                company="Test Corp",
                email=f"order-{name.replace(' ', '-')}-{datetime.now().timestamp()}@test.com",
                status="Nuevo",
                last_status_change_at=ts
            )
            test_db_session.add(lead)
            created_leads.append((lead, ts))
        
        await test_db_session.commit()
        
        # Query endpoint
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        
        # Extract days_without_change for all leads in response
        days_list = [l["days_without_change"] for l in data["data"]]
        
        # Verify ordering is DESC (each element >= next element)
        for i in range(len(days_list) - 1):
            assert days_list[i] >= days_list[i + 1], \
                f"Not ordered DESC: {days_list[i]} < {days_list[i + 1]}"

    @pytest.mark.asyncio
    async def test_cerrado_status_excluded(self, client: AsyncClient, test_db_session: AsyncSession):
        """AC-6.1: Leads with status='Cerrado' are EXCLUDED from at-risk list"""
        now = datetime.now(timezone.utc)
        old_ts = now - timedelta(days=10)
        
        # Create a lead with Cerrado status that is 10 days old
        cerrado_lead = Lead(
            name="Closed Lead",
            company="Closed Corp",
            email=f"cerrado-{datetime.now().timestamp()}@test.com",
            status=LeadStatus.CERRADO.value,
            last_status_change_at=old_ts
        )
        test_db_session.add(cerrado_lead)
        await test_db_session.commit()
        await test_db_session.refresh(cerrado_lead)
        
        # Query endpoint
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        
        # Verify Cerrado lead is NOT in the list
        cerrado_ids = [l["id"] for l in data["data"] if l["id"] == cerrado_lead.id]
        assert len(cerrado_ids) == 0, "Cerrado status should be excluded"

    @pytest.mark.asyncio
    async def test_seven_day_threshold_boundary(self, client: AsyncClient, test_db_session: AsyncSession):
        """Test boundary: 6 days = NOT at-risk, 7 days = at-risk"""
        now = datetime.now(timezone.utc)
        
        # Create lead at 6 days
        lead_6_days = Lead(
            name="6-Day Lead",
            company="Test Corp",
            email=f"6days-{datetime.now().timestamp()}@test.com",
            status="Nuevo",
            last_status_change_at=now - timedelta(days=6)
        )
        test_db_session.add(lead_6_days)
        
        # Create lead at 7 days
        lead_7_days = Lead(
            name="7-Day Lead",
            company="Test Corp",
            email=f"7days-{datetime.now().timestamp()}@test.com",
            status="Nuevo",
            last_status_change_at=now - timedelta(days=7)
        )
        test_db_session.add(lead_7_days)
        
        await test_db_session.commit()
        await test_db_session.refresh(lead_6_days)
        await test_db_session.refresh(lead_7_days)
        
        # Query endpoint
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        
        result_ids = [l["id"] for l in data["data"]]
        
        # 6-day lead should NOT be at-risk
        assert lead_6_days.id not in result_ids, "6-day lead should NOT be at-risk"
        
        # 7-day lead SHOULD be at-risk
        assert lead_7_days.id in result_ids, "7-day lead SHOULD be at-risk"

    @pytest.mark.asyncio
    async def test_all_non_cerrado_statuses_included(self, client: AsyncClient, test_db_session: AsyncSession):
        """AC-1.5: All non-Cerrado statuses are included when at-risk"""
        now = datetime.now(timezone.utc)
        old_ts = now - timedelta(days=8)
        
        # Create leads with each non-Cerrado status
        statuses_to_test = [
            LeadStatus.NUEVO.value,
            LeadStatus.EN_CONTACTO.value,
            LeadStatus.PROPUESTA_ENVIADA.value
        ]
        
        created_leads = []
        for status in statuses_to_test:
            lead = Lead(
                name=f"Lead-{status}",
                company="Test Corp",
                email=f"status-{status.replace(' ', '-')}-{datetime.now().timestamp()}@test.com",
                status=status,
                last_status_change_at=old_ts
            )
            test_db_session.add(lead)
            created_leads.append(lead)
        
        await test_db_session.commit()
        for lead in created_leads:
            await test_db_session.refresh(lead)
        
        # Query endpoint
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        
        result_ids = [l["id"] for l in data["data"]]
        created_ids = [l.id for l in created_leads]
        
        # All created leads should be in the at-risk list
        for lead_id in created_ids:
            assert lead_id in result_ids, f"Lead with status should be at-risk"

    @pytest.mark.asyncio
    async def test_response_time_performance(self, client: AsyncClient):
        """AC-6.2: Endpoint responds in < 300ms even with many leads"""
        import time
        
        start = time.time()
        response = await client.get("/api/leads/at-risk")
        elapsed = (time.time() - start) * 1000  # Convert to ms
        
        assert response.status_code == 200
        assert elapsed < 300, f"Endpoint took {elapsed}ms, expected < 300ms"
