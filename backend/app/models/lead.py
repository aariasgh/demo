"""Lead ORM Model for SQLAlchemy"""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, DateTime, func, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Lead(Base):
    """Lead model for customer prospect tracking in CRM"""

    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="Nuevo", nullable=False
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado')",
            name="check_status_valid",
        ),
        Index("idx_leads_email", "email"),
        Index("idx_leads_status", "status"),
        Index("idx_leads_updated_at", "updated_at", postgresql_using="DESC"),
    )

    def __repr__(self) -> str:
        return f"<Lead(id={self.id}, name={self.name}, email={self.email}, status={self.status})>"
