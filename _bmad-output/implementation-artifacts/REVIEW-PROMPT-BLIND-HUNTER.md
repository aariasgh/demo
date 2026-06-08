# BLIND HUNTER REVIEW - E1-S2
# (Revisión Adversarial - SIN Contexto de Especificación)
# Ejecutar en sesión separada

## Instrucciones
Eres un Revisor de Código Cínico (Blind Hunter). Revisa este diff de E1-S2 con CERO contexto de proyecto — solo sintaxis, patrones y riesgos obvios.

## E1-S2 Archivos Creados:

### backend/app/models/base.py
```python
"""SQLAlchemy Declarative Base"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()
```

### backend/app/models/user.py
```python
"""User ORM Model for SQLAlchemy"""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("idx_users_email", "email"),
        Index("idx_users_username", "username"),
    )
```

### backend/app/models/lead.py
```python
"""Lead ORM Model for SQLAlchemy"""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, DateTime, func, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, server_default="Nuevo")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("idx_leads_email", "email"),
        Index("idx_leads_status", "status"),
        Index("idx_leads_updated_at", "updated_at"),
        CheckConstraint(
            "status IN ('Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado')",
            name="check_lead_status",
        ),
    )
```

### backend/app/models/audit.py
```python
"""LeadAuditLog ORM Model for SQLAlchemy"""

from datetime import datetime
from typing import Optional, Any, Dict

from sqlalchemy import BigInteger, Integer, String, Text, DateTime, func, Index, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class LeadAuditLog(Base):
    __tablename__ = "lead_audit_log"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    old_value: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    new_value: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_audit_lead_id", "lead_id"),
        Index("idx_audit_created_at", "created_at"),
        Index("idx_audit_event_type", "event_type"),
    )

    # Relationships
    lead: Mapped["Lead"] = relationship("Lead", foreign_keys=[lead_id])
```

### backend/alembic/versions/323f0096ff65_initial_schema.py (primeras 60 líneas)
```python
def upgrade() -> None:
    """Upgrade schema - create users, leads, and lead_audit_log tables."""
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(512), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email'),
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_username', 'users', ['username'])

    # Create leads table
    op.create_table(
        'leads',
        # ... (similar structure)
    )
    
def downgrade() -> None:
    """Downgrade schema - drop all tables."""
    # Reverse order with FK dependencies
```

### backend/tests/test_schema.py (sample tests)
```python
def test_users_table_exists(self, pg_connection):
    """Verify users table exists with correct columns"""
    cur = pg_connection.cursor()
    cur.execute(
        "SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position"
    )
    columns = [row[0] for row in cur.fetchall()]
    cur.close()

    expected = ["id", "username", "email", "password_hash", "created_at", "updated_at"]
    assert columns == expected, f"Users table columns mismatch: {columns}"
```

## TAREA PRINCIPAL

**Reporta hallazgos en formato Markdown:**
- Una línea de título
- Categoría (sintaxis, anti-patrón, seguridad, type-safety, testabilidad, performance)
- Evidencia desde el código
- Severidad (🔴 crítico, 🟡 advertencia, 🟢 info)

**Ejemplos de lo que buscar:**
- Imports faltantes o no usados
- Convenciones de nombres inconsistentes
- Type hints incompletos o incorrectos
- Lógica duplicada
- Falta de validación de entrada
- Posibles excepciones no manejadas
- Performance roja flags (N+1 queries, índices faltantes)
- Consistencia en patrones
