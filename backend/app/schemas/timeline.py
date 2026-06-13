"""Pydantic schemas for Timeline API"""

from datetime import datetime
from typing import Optional, Any, Dict, List
from enum import Enum

from pydantic import BaseModel, Field


class TimelineEventTypeSchema(str, Enum):
    """Frontend-friendly event types"""
    LEAD_CREATED = "LEAD_CREATED"
    STATUS_CHANGED = "STATUS_CHANGED"
    NOTE_ADDED = "NOTE_ADDED"
    CALL_MADE = "CALL_MADE"
    EMAIL_SENT = "EMAIL_SENT"


class TimelineEventCreate(BaseModel):
    """Request schema: Create timeline event"""
    event_type: TimelineEventTypeSchema
    description: str = Field(..., min_length=1, max_length=2000)
    metadata: Optional[Dict[str, Any]] = None


class TimelineEventResponse(BaseModel):
    """Response schema: Single timeline event"""
    id: int
    lead_id: int
    event_type: TimelineEventTypeSchema
    description: str
    timestamp: datetime
    event_metadata: Optional[Dict[str, Any]]
    created_by: str
    
    model_config = {"from_attributes": True}


class TimelineListResponse(BaseModel):
    """Response schema: List of timeline events"""
    data: List[TimelineEventResponse]
    meta: Dict[str, Any] = Field(default_factory=lambda: {
        "total": 0,
        "limit": 50,
        "offset": 0,
    })


class TimelineFilterRequest(BaseModel):
    """Query parameters for filtering timeline"""
    lead_id: int
    event_type: Optional[TimelineEventTypeSchema] = None
    limit: int = Field(default=50, ge=1, le=500)
    offset: int = Field(default=0, ge=0)
