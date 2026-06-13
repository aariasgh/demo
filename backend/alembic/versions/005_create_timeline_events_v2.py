"""Create timeline_events table

Revision ID: 005
Revises: c85529f44a74
Create Date: 2026-06-12 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers
revision = '005'
down_revision = 'c85529f44a74'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create table with VARCHAR for robustness
    op.create_table(
        'timeline_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('event_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_by', sa.String(255), nullable=False, server_default='system'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_timeline_lead_id', 'timeline_events', ['lead_id'])
    op.create_index('idx_timeline_timestamp', 'timeline_events', ['timestamp'])
    op.create_index('idx_timeline_event_type', 'timeline_events', ['event_type'])
    op.create_index('idx_timeline_lead_timestamp', 'timeline_events', ['lead_id', 'timestamp'])


def downgrade() -> None:
    op.drop_table('timeline_events')
