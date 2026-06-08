"""User ORM Model for SQLAlchemy"""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class User(Base):
    """User model for authentication and audit trail"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False
    )

    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_username", "username"),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
