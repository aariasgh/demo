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


def downgrade() -> None:
    """Remove field_name column"""
    op.drop_column('lead_audit_log', 'field_name')
