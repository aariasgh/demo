"""Debug test to check status filtering"""

import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.models.lead import Lead, LeadStatus
from app.config import settings

async def debug_test():
    """Debug status filtering"""
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
            print("=" * 70)
            print("DEBUG: Check status filtering")
            print("=" * 70)
            
            # Create a lead (will be "Nuevo")
            lead_data = {
                "name": "Debug Closed Lead",
                "company": "DebugCorp",
                "email": f"debug-{int(datetime.now().timestamp())}@test.com",
                "notes": "For debugging"
            }
            
            response = await client.post("/api/leads", json=lead_data)
            assert response.status_code == 201
            lead = response.json()
            lead_id = lead["id"]
            print(f"\n1. Created lead ID={lead_id}, status={lead['status']}")
            
            # UPDATE the status to "Cerrado" directly in DB
            async with async_session() as db:
                lead_obj = await db.get(Lead, lead_id)
                if lead_obj:
                    print(f"2. Current DB status: '{lead_obj.status}'")
                    # Change to Cerrado
                    lead_obj.status = LeadStatus.CERRADO.value  # "Cerrado"
                    print(f"3. Updating status to: '{LeadStatus.CERRADO.value}'")
                    db.add(lead_obj)
                    await db.commit()
                    print(f"4. Status updated in DB")
            
            # Verify status was updated
            response = await client.get(f"/api/leads/{lead_id}")
            assert response.status_code == 200
            fetched = response.json()
            print(f"5. Fetched lead via API: status={fetched['status']}")
            
            # Update to be old
            async with async_session() as db:
                lead_obj = await db.get(Lead, lead_id)
                if lead_obj:
                    # Make old
                    old_ts = datetime.now(timezone.utc) - timedelta(days=8)
                    lead_obj.last_status_change_at = old_ts
                    db.add(lead_obj)
                    await db.commit()
                    print(f"6. Updated last_status_change_at to 8 days ago")
            
            # Check at-risk endpoint
            response = await client.get("/api/leads/at-risk")
            data = response.json()
            print(f"\n7. At-risk leads count: {data['count']}")
            if data["count"] > 0:
                for lead in data["data"]:
                    print(f"   - ID={lead['id']}, status='{lead['status']}', days={lead['days_without_change']}")
                    
                # Check if our debug lead is in the list
                debug_ids = [l["id"] for l in data["data"] if l["id"] == lead_id]
                if debug_ids:
                    print(f"\n❌ ERROR: Cerrado lead (ID={lead_id}) is in at-risk list!")
                else:
                    print(f"\n✓ Cerrado lead (ID={lead_id}) correctly excluded")
            else:
                print("✓ No at-risk leads (Cerrado lead correctly excluded)")
            
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(debug_test())
