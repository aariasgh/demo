"""Test at-risk endpoint with sample data"""

import asyncio
import httpx
import json
from datetime import datetime, timezone, timedelta

async def test_at_risk():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        print("=" * 60)
        print("TEST 1: Endpoint returns empty list (no leads at risk)")
        print("=" * 60)
        
        response = await client.get("/api/leads/at-risk")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2, default=str)}")
        assert data["count"] == 0, "Should be empty initially"
        assert data["data"] == [], "Data should be empty list"
        print("✓ PASS\n")
        
        print("=" * 60)
        print("TEST 2: Create test lead and check it's not at-risk (new)")
        print("=" * 60)
        
        lead_data = {
            "name": "New Lead - Not At Risk",
            "company": "TechCorp",
            "email": f"new-{int(datetime.now().timestamp())}@test.com",
            "phone": "+34917777777",
            "status": "Nuevo",
            "notes": "Fresh lead created today"
        }
        
        response = await client.post("/api/leads", json=lead_data)
        print(f"Create lead status: {response.status_code}")
        assert response.status_code == 201
        lead = response.json()
        lead_id = lead["id"]
        print(f"Created lead ID: {lead_id}")
        print(f"  - Name: {lead['name']}")
        print(f"  - Last status change: {lead.get('last_status_change_at')}")
        
        # Check at-risk endpoint (should still be empty)
        response = await client.get("/api/leads/at-risk")
        data = response.json()
        print(f"At-risk leads count: {data['count']}")
        assert data["count"] == 0, "New lead should not be at-risk"
        print("✓ PASS\n")
        
        print("=" * 60)
        print("TEST 3: Verify endpoint structure and fields")
        print("=" * 60)
        
        # Check response structure
        assert "data" in data, "Response must have 'data' field"
        assert "count" in data, "Response must have 'count' field"
        print("✓ Response structure is correct")
        print("✓ PASS\n")
        
        print("=" * 60)
        print("ALL TESTS PASSED!")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_at_risk())
