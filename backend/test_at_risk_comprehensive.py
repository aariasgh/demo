"""Comprehensive test of at-risk endpoint with database manipulation"""

import asyncio
import httpx
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.models.lead import Lead
from app.config import settings

async def test_at_risk_comprehensive():
    """Test at-risk detection with old leads created in database"""
    
    # Setup async database connection
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        # Create test leads via API
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            print("=" * 70)
            print("COMPREHENSIVE AT-RISK ENDPOINT TEST")
            print("=" * 70)
            
            # Test 1: Empty at-risk list
            print("\n[TEST 1] Empty at-risk list")
            print("-" * 70)
            response = await client.get("/api/leads/at-risk")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data["data"], list)
            assert isinstance(data["count"], int)
            print(f"✓ Empty list returns: {json.dumps(data, indent=2)}")
            
            # Test 2: Create new lead (should NOT be at-risk)
            print("\n[TEST 2] New lead should NOT be at-risk")
            print("-" * 70)
            lead_data = {
                "name": "Fresh Lead",
                "company": "NewCorp",
                "email": f"fresh-{int(datetime.now().timestamp())}@test.com",
                "phone": "+34917777777",
                "status": "Nuevo",
                "notes": "Created today"
            }
            response = await client.post("/api/leads", json=lead_data)
            assert response.status_code == 201
            fresh_lead = response.json()
            fresh_id = fresh_lead["id"]
            fresh_email = fresh_lead["email"]
            print(f"✓ Created fresh lead ID={fresh_id}")
            print(f"  - last_status_change_at: {fresh_lead.get('last_status_change_at')}")
            
            response = await client.get("/api/leads/at-risk")
            data = response.json()
            initial_count = data["count"]
            
            # Check that our fresh lead is NOT in the at-risk list
            fresh_ids = [lead["id"] for lead in data["data"] if lead["id"] == fresh_id]
            assert len(fresh_ids) == 0, "Fresh lead should not be at-risk"
            print(f"✓ Fresh lead correctly NOT in at-risk list (total count: {initial_count})")
            
            # Test 3: Manually update lead to be 8 days old
            print("\n[TEST 3] Lead updated to 8 days ago SHOULD be at-risk")
            print("-" * 70)
            async with async_session() as db:
                # Get the fresh lead and update its timestamp
                lead = await db.get(Lead, fresh_id)
                if lead:
                    old_timestamp = datetime.now(timezone.utc) - timedelta(days=8)
                    lead.last_status_change_at = old_timestamp
                    db.add(lead)
                    await db.commit()
                    print(f"✓ Updated lead {fresh_id} last_status_change_at to 8 days ago")
            
            # Query at-risk endpoint (should now include this lead)
            response = await client.get("/api/leads/at-risk")
            data = response.json()
            print(f"✓ At-risk count: {data['count']}")
            
            if data["count"] > 0:
                print(f"✓ At-risk leads detected:")
                for lead in data["data"]:
                    print(f"  - ID={lead['id']}, name={lead['name']}, days_without_change={lead['days_without_change']}")
                    
                    # Verify response structure
                    required_fields = ["id", "name", "company", "email", "status", "days_without_change", 
                                     "created_at", "last_status_change_at"]
                    for field in required_fields:
                        assert field in lead, f"Missing field: {field}"
                    
                    # Verify days_without_change is at least 8
                    assert lead["days_without_change"] >= 8, f"Expected >= 8 days, got {lead['days_without_change']}"
                    print(f"✓ All required fields present")
                    print(f"✓ days_without_change calculation correct")
            
            # Test 4: Verify "Cerrado" status is excluded
            print("\n[TEST 4] Leads with 'Cerrado' status SHOULD be excluded")
            print("-" * 70)
            
            # Create a lead (will be "Nuevo")
            lead_data_cerrado = {
                "name": "Closed Lead",
                "company": "OldCorp",
                "email": f"closed-{int(datetime.now().timestamp())}@test.com",
                "phone": "+34917777777",
                "notes": "Already closed"
            }
            response = await client.post("/api/leads", json=lead_data_cerrado)
            assert response.status_code == 201
            closed_lead = response.json()
            closed_id = closed_lead["id"]
            print(f"✓ Created lead ID={closed_id}")
            
            # Update to be Cerrado and old via database
            async with async_session() as db:
                lead_obj = await db.get(Lead, closed_id)
                if lead_obj:
                    lead_obj.status = LeadStatus.CERRADO.value  # Set to "Cerrado"
                    old_timestamp = datetime.now(timezone.utc) - timedelta(days=10)
                    lead_obj.last_status_change_at = old_timestamp
                    db.add(lead_obj)
                    await db.commit()
                    print(f"✓ Updated to status='Cerrado' and 10 days ago")
            
            # Query at-risk endpoint
            response = await client.get("/api/leads/at-risk")
            data = response.json()
            
            # Check that closed lead is NOT in the list
            closed_ids = [lead["id"] for lead in data["data"]]
            assert closed_id not in closed_ids, "Cerrado status should be excluded"
            print(f"✓ Closed lead correctly excluded from at-risk list")
            
            # Test 5: Verify ordering (DESC by days_without_change = oldest first)
            print("\n[TEST 5] Verify ordering (DESC by days_without_change)")
            print("-" * 70)
            
            if len(data["data"]) > 1:
                days_list = [lead["days_without_change"] for lead in data["data"]]
                sorted_days = sorted(days_list, reverse=True)  # Should be in descending order
                assert days_list == sorted_days, f"Not ordered correctly: {days_list}"
                print(f"✓ Leads ordered correctly: {days_list}")
            else:
                print("✓ Only one lead at-risk, ordering verified (single element)")
            
            print("\n" + "=" * 70)
            print("✓ ALL COMPREHENSIVE TESTS PASSED!")
            print("=" * 70)
            
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_at_risk_comprehensive())
