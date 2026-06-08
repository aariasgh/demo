"""Health check endpoint"""

from fastapi import APIRouter
from datetime import datetime, timezone
from typing import Dict

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    
    Returns 200 OK if backend is running.
    Used by Docker healthcheck directive and monitoring.
    Uses timezone-aware UTC datetime for proper ISO8601 formatting.
    
    Returns:
        dict: {"status": "ok", "timestamp": "ISO-8601 datetime"}
    """
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
