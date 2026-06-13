"""LeadAuditLog ORM Model for SQLAlchemy"""

from datetime import datetime, timezone
from typing import Optional, Any, Dict, TYPE_CHECKING

from sqlalchemy import BigInteger, Integer, String, Text, DateTime, Index, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class LeadAuditLog(Base):
    """Audit log model for tracking all changes to leads"""

    __tablename__ = "lead_audit_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    old_value: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    new_value: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    field_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    if TYPE_CHECKING:
        from .lead import Lead
    
    lead: Mapped["Lead"] = relationship("Lead", foreign_keys=[lead_id])

    __table_args__ = (
        Index("idx_audit_lead_id", "lead_id"),
        Index("idx_audit_created_at", "created_at"),
        Index("idx_audit_event_type", "event_type"),
    )

    def __repr__(self) -> str:
        return f"<LeadAuditLog(id={self.id}, lead_id={self.lead_id}, event_type={self.event_type})>"
