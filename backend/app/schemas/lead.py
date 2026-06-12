"""Pydantic schemas for Lead API requests/responses"""

import re
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.lead import LeadStatus, LeadPriority


class LeadBase(BaseModel):
    """Base schema with common Lead fields - DO NOT USE DIRECTLY for requests/responses"""
    name: str = Field(..., min_length=2, max_length=255, description="Lead name")
    company: str = Field(..., min_length=2, max_length=255, description="Company name")
    email: str = Field(..., description="Lead email (must be unique)")
    phone: Optional[str] = Field(None, max_length=20, description="Optional phone number")
    priority: Optional[str] = Field(default="Media", description="Lead priority level")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional notes")

    @field_validator('name', 'company', mode='before')
    @classmethod
    def strip_whitespace(cls, v):
        """Strip leading/trailing whitespace from name and company"""
        if isinstance(v, str):
            v = v.strip()
        return v

    @field_validator('name', 'company')
    @classmethod
    def not_empty_after_strip(cls, v):
        """Validate field is not empty or only whitespace"""
        if not v or not v.strip():
            raise ValueError('Field cannot be empty or contain only whitespace')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Validate email format without external dependencies"""
        # Basic email validation regex (RFC 5322 simplified)
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v

    @field_validator('notes')
    @classmethod
    def validate_notes_length(cls, v):
        """Validate notes don't exceed character limit"""
        if v and len(v) > 1000:
            raise ValueError(f'notes cannot exceed 1000 characters (you provided {len(v)})')
        return v


class LeadCreate(LeadBase):
    """Schema for POST /api/leads request - inherits validation from LeadBase"""
    pass


class LeadResponse(LeadBase):
    """Schema for API response - includes DB-generated fields and uses ORM conversion"""
    id: int = Field(..., description="Lead unique identifier")
    status: str = Field(default="Nuevo", description="Lead status")
    priority: str = Field(default="Media", description="Lead priority level")
    created_at: datetime = Field(..., description="Lead creation timestamp")
    updated_at: datetime = Field(..., description="Lead last update timestamp")
    last_status_change_at: Optional[datetime] = Field(None, description="Timestamp of last status change")

    model_config = ConfigDict(from_attributes=True)


class LeadListMeta(BaseModel):
    """Pagination metadata for lead list responses."""
    total: int = Field(..., ge=0, description="Total number of matching leads")
    limit: int = Field(..., ge=1, description="Page size")
    offset: int = Field(..., ge=0, description="Offset applied")


class LeadListResponse(BaseModel):
    """Schema for GET /api/leads response payload."""
    data: list[LeadResponse] = Field(default_factory=list, description="List of leads")
    meta: LeadListMeta = Field(..., description="Pagination metadata")

    model_config = ConfigDict(from_attributes=True)


class LeadUpdate(BaseModel):
    """Schema for PUT /api/leads/{id} - supports partial updates with all fields optional"""
    name: Optional[str] = Field(None, min_length=2, max_length=255, description="Update lead name")
    company: Optional[str] = Field(None, min_length=2, max_length=255, description="Update company name")
    email: Optional[str] = Field(None, description="Update lead email (must remain unique)")
    phone: Optional[str] = Field(None, max_length=20, description="Update optional phone")
    notes: Optional[str] = Field(None, max_length=1000, description="Update optional notes")

    @field_validator('name', 'company', mode='before')
    @classmethod
    def strip_whitespace(cls, v):
        """Strip whitespace - skip if None (field not provided)"""
        if v is None:
            return None
        if isinstance(v, str):
            v = v.strip()
        return v

    @field_validator('name', 'company')
    @classmethod
    def not_empty_after_strip(cls, v):
        """Validate not empty after stripping - skip if None"""
        if v is None:
            return None
        if not v or not v.strip():
            raise ValueError('Field cannot be empty or contain only whitespace')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Validate email format - skip if None (no change)"""
        if v is None:
            return None
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v

    @field_validator('notes')
    @classmethod
    def validate_notes_length(cls, v):
        """Validate notes length - skip if None"""
        if v is None:
            return None
        if len(v) > 1000:
            raise ValueError(f'notes cannot exceed 1000 characters (you provided {len(v)})')
        return v

    class Config:
        from_attributes = True


class LeadStatusUpdate(BaseModel):
    """Schema for PATCH /api/leads/{id}/status endpoint"""
    new_status: LeadStatus = Field(..., description="New lead status")

    model_config = ConfigDict(from_attributes=True)
