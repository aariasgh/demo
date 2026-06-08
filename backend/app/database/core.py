"""Database engine and session factory setup for async operations"""

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create async engine with connection pooling
try:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,  # Set to True for SQL debugging
        pool_size=20,  # Min connections in pool (spec requirement)
        max_overflow=0,  # No overflow; total pool size = 20 (matches spec)
        pool_pre_ping=True,  # Verify connection health before using
    )
    logger.info("✅ Database engine initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize database engine: {e}")
    raise

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
)


async def get_db():
    """
    FastAPI dependency: Provides an async database session.
    
    Handles both request success and failure scenarios.
    Ensures proper cleanup of session resources.
    
    Usage:
        async def my_endpoint(db: AsyncSession = Depends(get_db)):
            # db is now available for database operations
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            # Rollback if an error occurs during request processing
            await session.rollback()
            raise
        finally:
            # Always close session, but handle close() errors separately
            # to avoid masking the original request exception
            try:
                await session.close()
            except Exception as e:
                logger.error(f"Error closing database session: {e}")
