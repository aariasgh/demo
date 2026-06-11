"""Add last_status_change_at column to leads table

Revision ID: add_status_change_ts
Revises: 323f0096ff65
Create Date: 2026-06-11 00:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_status_change_ts'
down_revision: Union[str, Sequence[str], None] = '323f0096ff65'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade: Add last_status_change_at column to leads table."""
    
    # Add the column with server default to CURRENT_TIMESTAMP
    op.add_column(
        'leads',
        sa.Column(
            'last_status_change_at',
            sa.DateTime(timezone=True),
            nullable=True,  # Nullable initially to allow adding to existing table
            server_default=sa.func.now()
        )
    )
    
    # Update existing records: set last_status_change_at to created_at
    op.execute("UPDATE leads SET last_status_change_at = created_at WHERE last_status_change_at IS NULL")
    
    # Make column NOT NULL after populating
    op.alter_column(
        'leads',
        'last_status_change_at',
        existing_type=sa.DateTime(timezone=True),
        nullable=False
    )
    
    # Create index for performance
    op.create_index(
        'idx_leads_last_status_change',
        'leads',
        ['last_status_change_at']
    )


def downgrade() -> None:
    """Downgrade: Remove last_status_change_at column from leads table."""
    
    # Drop index
    op.drop_index('idx_leads_last_status_change', table_name='leads')
    
    # Drop column
    op.drop_column('leads', 'last_status_change_at')
