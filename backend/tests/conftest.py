"""Pytest configuration and shared fixtures for all tests"""

import pytest
import pytest_asyncio
from typing import AsyncGenerator
import os
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy import text

from app.models.base import Base
from app.database import get_db
from app.main import app


# Test database configuration - uses test database from PostgreSQL
# This creates a separate database from the production one
TEST_DATABASE_URL = (
    f"postgresql+asyncpg://"
    f"{os.getenv('DB_USER', 'postgres')}:"
    f"{os.getenv('DB_PASSWORD', 'postgres')}@"
    f"{os.getenv('DB_HOST', 'localhost')}:"
    f"{os.getenv('DB_PORT', '5432')}/"
    f"{os.getenv('DB_NAME', 'minicrmdb')}_test"
)


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """
    Create async SQLAlchemy engine for test database.
    This fixture is function-scoped to work properly with pytest-asyncio.
    Tables are created fresh for each test function.
    """
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        pool_size=5,
        max_overflow=0,
        pool_pre_ping=True,
    )
    
    # Create all tables in test database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Cleanup after test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest_asyncio.fixture
async def test_db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """
    Provide a clean database session for each test.
    - Creates session from test engine
    - Clears all data before test (TRUNCATE for speed)
    - Rolls back after test to ensure isolation
    """
    # Create session factory from test engine
    session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with session_factory() as session:
        # Clear all tables before test for isolation
        # Using raw SQL for efficiency
        try:
            await session.execute(text("TRUNCATE TABLE lead_audit_log CASCADE"))
        except Exception:
            pass  # Table might not exist yet
        
        try:
            await session.execute(text("TRUNCATE TABLE leads CASCADE"))
        except Exception:
            pass  # Table might not exist yet
        
        try:
            await session.commit()
        except Exception:
            pass
        
        yield session
        
        # Rollback after test to ensure no leftover transaction
        try:
            await session.rollback()
        except Exception:
            pass


@pytest_asyncio.fixture
async def client(test_db_session: AsyncSession):
    """
    Provide FastAPI test client with overridden database dependency.
    This ensures all requests in tests use the test database session.
    """
    # Create override function that yields our test session
    async def override_get_db():
        yield test_db_session
    
    # Apply the override to FastAPI app
    app.dependency_overrides[get_db] = override_get_db
    
    # Import here to avoid circular imports
    from httpx import AsyncClient, ASGITransport

    # Create and yield test client.
    # httpx >= 0.28 removed the `app=` shortcut; drive the ASGI app via ASGITransport.
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Clean up: remove the override after the test so it does not leak
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]


@pytest_asyncio.fixture
async def db_session(test_db_session: AsyncSession):
    """Alias for test_db_session for direct database access in tests"""
    return test_db_session


@pytest_asyncio.fixture
async def created_lead(client):
    """Fixture: Creates a single lead for testing"""
    payload = {
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "priority": "Media",
        "notes": "Lead muy interesado"
    }
    response = await client.post("/api/leads", json=payload)
    assert response.status_code == 201
    return response.json()


@pytest_asyncio.fixture
async def two_created_leads(client):
    """Fixture: Creates two leads for testing"""
    lead1_payload = {
        "name": "Lead One",
        "company": "Company One",
        "email": "lead1@test.com",
        "priority": "Alta",
    }
    lead1_response = await client.post("/api/leads", json=lead1_payload)
    assert lead1_response.status_code == 201
    
    lead2_payload = {
        "name": "Lead Two",
        "company": "Company Two",
        "email": "lead2@test.com",
        "priority": "Baja",
    }
    lead2_response = await client.post("/api/leads", json=lead2_payload)
    assert lead2_response.status_code == 201
    
    return [lead1_response.json(), lead2_response.json()]
    """Fixture: Creates two leads for testing"""
    lead1_payload = {
        "name": "Lead 1",
        "company": "Company A",
        "email": "lead1@test.com",
    }
    lead2_payload = {
        "name": "Lead 2",
        "company": "Company B",
        "email": "lead2@test.com",
    }
    
    response1 = await client.post("/api/leads", json=lead1_payload)
    response2 = await client.post("/api/leads", json=lead2_payload)
    
    assert response1.status_code == 201
    assert response2.status_code == 201

    return response1.json(), response2.json()
