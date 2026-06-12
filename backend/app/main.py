"""
FastAPI application initialization and setup

Main entry point for the Mini CRM backend API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, leads
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create FastAPI app instance
app = FastAPI(
    title="Mini CRM API",
    description="Backend para Mini CRM de Seguimiento de Clientes",
    version="0.1.0",
)

# CORS middleware: Use configurable origins from environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(health.router)
app.include_router(leads.router)


@app.on_event("startup")
async def startup():
    """Initialize application on startup with error handling"""
    try:
        logger.info("🚀 Backend starting...")
        # Migrations are run via Docker CMD before Uvicorn starts
        logger.info("✅ Backend started successfully")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise


@app.on_event("shutdown")
async def shutdown():
    """Cleanup resources on shutdown"""
    try:
        logger.info("🛑 Backend shutting down...")
        # Cleanup logic can go here
        logger.info("✅ Backend stopped")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")
