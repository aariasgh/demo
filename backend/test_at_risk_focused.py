"""Simple focused test of at-risk endpoint functionality"""

import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.models.lead import Lead, LeadStatus
from app.config import settings

async def test_at_risk_focused():
    """Focused test of core at-risk functionality"""
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            print("=" * 70)
            print("FOCUSED AT-RISK ENDPOINT TEST")
            print("=" * 70)
            
            # ✓ TEST 1: Response structure
            print("\n[TEST 1] Response structure and schema")
            print("-" * 70)
            response = await client.get("/api/leads/at-risk")
            assert response.status_code == 200
            data = response.json()
            assert "data" in data and isinstance(data["data"], list)
            assert "count" in data and isinstance(data["count"], int)
            assert data["count"] == len(data["data"])
            print(f"✓ Response has correct structure: {{'data': [...], 'count': ...}}")
            print(f"✓ Count matches data array length")
            
            # ✓ TEST 2: At-risk detection accuracy
            print("\n[TEST 2] At-risk detection (7+ days old)")
            print("-" * 70)
            
            # Create a test lead
            lead_response = await client.post("/api/leads", json={
                "name": "Test Lead",
                "company": "Test Corp",
                "email": f"test-{int(datetime.now().timestamp())}@example.com"
            })
            test_lead_id = lead_response.json()["id"]
            print(f"✓ Created test lead ID={test_lead_id}")
            
            # Verify it's NOT at-risk (new lead)
            response = await client.get("/api/leads/at-risk")
            at_risk_before = [l for l in response.json()["data"] if l["id"] == test_lead_id]
            assert len(at_risk_before) == 0
            print(f"✓ New lead is NOT at-risk")
            
            # Update to be 8 days old
            async with async_session() as db:
                lead = await db.get(Lead, test_lead_id)
                lead.last_status_change_at = datetime.now(timezone.utc) - timedelta(days=8)
                db.add(lead)
                await db.commit()
            print(f"✓ Updated to 8 days old")
            
            # Verify it IS at-risk now
            response = await client.get("/api/leads/at-risk")
            at_risk_after = [l for l in response.json()["data"] if l["id"] == test_lead_id]
            assert len(at_risk_after) == 1
            print(f"✓ 8-day-old lead IS at-risk")
            
            # Verify days_without_change calculation
            days_calc = at_risk_after[0]["days_without_change"]
            assert days_calc >= 8, f"Expected >= 8, got {days_calc}"
            print(f"✓ days_without_change correctly calculated: {days_calc}")
            
            # ✓ TEST 3: Status filtering (Cerrado excluded)
            print("\n[TEST 3] Status='Cerrado' exclusion")
            print("-" * 70)
            
            # Create another test lead
            lead_response = await client.post("/api/leads", json={
                "name": "Closed Lead",
                "company": "Closed Corp",
                "email": f"closed-{int(datetime.now().timestamp())}@example.com"
            })
            closed_lead_id = lead_response.json()["id"]
            print(f"✓ Created closed test lead ID={closed_lead_id}")
            
            # Update to Cerrado + old
            async with async_session() as db:
                lead = await db.get(Lead, closed_lead_id)
                lead.status = LeadStatus.CERRADO.value
                lead.last_status_change_at = datetime.now(timezone.utc) - timedelta(days=9)
                db.add(lead)
                await db.commit()
            print(f"✓ Updated to status='Cerrado', 9 days old")
            
            # Verify it's NOT in at-risk list
            response = await client.get("/api/leads/at-risk")
            at_risk_closed = [l for l in response.json()["data"] if l["id"] == closed_lead_id]
            assert len(at_risk_closed) == 0
            print(f"✓ Cerrado lead correctly EXCLUDED from at-risk list")
            
            # ✓ TEST 4: Response fields
            print("\n[TEST 4] Response includes all required fields")
            print("-" * 70)
            
            response = await client.get("/api/leads/at-risk")
            if response.json()["count"] > 0:
                sample_lead = response.json()["data"][0]
                required_fields = [
                    "id", "name", "company", "email", "status",
                    "days_without_change", "created_at", "last_status_change_at"
                ]
                for field in required_fields:
                    assert field in sample_lead, f"Missing: {field}"
                    print(f"✓ Field present: {field}")
            
            # ✓ TEST 5: Ordering (DESC by days_without_change = oldest first)
            print("\n[TEST 5] Ordering (DESC by days_without_change)")
            print("-" * 70)
            
            response = await client.get("/api/leads/at-risk")
            leads = response.json()["data"]
            if len(leads) > 1:
                days_list = [l["days_without_change"] for l in leads]
                is_sorted = all(days_list[i] >= days_list[i+1] for i in range(len(days_list)-1))
                assert is_sorted, f"Not sorted DESC: {days_list}"
                print(f"✓ Leads ordered DESC by days_without_change: {days_list[:3]}...")
            else:
                print(f"✓ Ordering check (only {len(leads)} lead(s))")
            
            print("\n" + "=" * 70)
            print("✅ ALL TESTS PASSED - AT-RISK ENDPOINT WORKING CORRECTLY")
            print("=" * 70)
            
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_at_risk_focused())
