"""Pydantic schemas for Audit Log API"""

from datetime import datetime
from typing import Optional, Any, Dict, List
from enum import Enum

from pydantic import BaseModel, Field


class AuditEventTypeSchema(str, Enum):
    """Frontend-friendly audit event types"""
    CREATED = "CREATED"
    FIELD_EDITED = "FIELD_EDITED"
    STATUS_CHANGED = "STATUS_CHANGED"
    DELETED = "DELETED"


class LeadAuditLogResponse(BaseModel):
    """Response schema: Single audit log entry"""
    id: int
    lead_id: int
    event_type: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    created_by_id: Optional[int] = None
    created_at: datetime
    meta: Optional[Dict[str, Any]] = None
    
    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    """Response schema: List of audit log entries"""
    data: List[LeadAuditLogResponse]
    meta: Dict[str, Any] = Field(default_factory=lambda: {
        "total": 0,
        "limit": 100,
        "offset": 0,
    })
