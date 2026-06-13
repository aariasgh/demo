"""TimelineEvent ORM Model for Activity Timeline"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Any, Dict, TYPE_CHECKING

from sqlalchemy import Integer, String, Text, DateTime, Index, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class TimelineEventType(str, Enum):
    """Valid timeline event types"""
    LEAD_CREATED = "LEAD_CREATED"           # Lead creado
    STATUS_CHANGED = "STATUS_CHANGED"       # Estado cambió
    NOTE_ADDED = "NOTE_ADDED"              # Nota agregada
    CALL_MADE = "CALL_MADE"                # Llamada registrada
    EMAIL_SENT = "EMAIL_SENT"              # Email enviado


class TimelineEvent(Base):
    """Timeline Event model for tracking lead activity"""

    __tablename__ = "timeline_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
    )
    event_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Timestamp: ISO 8601, UTC timezone
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    
    # Metadata: JSON flexible storage for event-specific data
    # Examples:
    #   STATUS_CHANGED: {"old_status": "Nuevo", "new_status": "En contacto"}
    #   CALL_MADE: {"duration_minutes": 15, "phone": "+1234567890"}
    #   EMAIL_SENT: {"subject": "Propuesta", "recipient": "john@example.com"}
    event_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    
    # Audit trail
    created_by: Mapped[str] = mapped_column(String(255), default="system", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    if TYPE_CHECKING:
        from .lead import Lead
    
    lead: Mapped["Lead"] = relationship("Lead", foreign_keys=[lead_id])

    __table_args__ = (
        Index("idx_timeline_lead_id", "lead_id"),
        Index("idx_timeline_timestamp", "timestamp"),
        Index("idx_timeline_event_type", "event_type"),
        Index("idx_timeline_lead_timestamp", "lead_id", "timestamp"),  # Composite for fast queries
    )

    def __repr__(self) -> str:
        return f"<TimelineEvent(id={self.id}, lead_id={self.lead_id}, type={self.event_type})>"
