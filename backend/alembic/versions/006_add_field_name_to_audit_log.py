"""Add field_name column to lead_audit_log table

Revision ID: 006
Revises: 005
Create Date: 2026-06-12 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add field_name column to lead_audit_log for tracking which field changed"""
    op.add_column('lead_audit_log', 
        sa.Column('field_name', sa.String(255), nullable=True)
    )
    
    # Add composite index for pagination queries (lead_id, created_at DESC)
    op.create_index(
        'idx_audit_lead_created_composite',
        'lead_audit_log',
        ['lead_id', sa.desc('created_at')],
        unique=False
    )


def downgrade() -> None:
    """Remove field_name column and composite index"""
    op.drop_index('idx_audit_lead_created_composite')
    op.drop_column('lead_audit_log', 'field_name')
