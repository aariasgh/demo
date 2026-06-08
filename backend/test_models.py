"""Quick test to verify autoincrement works"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.base import Base
from app.models.lead import Lead
from app.models.audit import LeadAuditLog
import asyncio

async def test():
    engine = create_async_engine('sqlite+aiosqlite:///:memory:', echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with SessionLocal() as session:
        lead = Lead(name='Test', company='Corp', email='test@test.com', status='nuevo')
        session.add(lead)
        await session.flush()
        print(f'Lead ID: {lead.id}')
        
        audit = LeadAuditLog(lead_id=lead.id, event_type='CREATED', new_value={})
        session.add(audit)
        await session.commit()
        print(f'Audit ID: {audit.id}')
        print('✅ Models work correctly')

if __name__ == '__main__':
    asyncio.run(test())
