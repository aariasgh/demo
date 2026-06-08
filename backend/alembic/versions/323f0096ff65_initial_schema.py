"""initial_schema

Revision ID: 323f0096ff65
Revises: 
Create Date: 2026-06-07 17:03:57.699781

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '323f0096ff65'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


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
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('company', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='Nuevo'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.CheckConstraint(
            "status IN ('Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado')",
            name='check_lead_status'
        ),
    )
    op.create_index('idx_leads_email', 'leads', ['email'])
    op.create_index('idx_leads_status', 'leads', ['status'])
    op.create_index('idx_leads_updated_at', 'leads', ['updated_at'])

    # Create lead_audit_log table
    op.create_table(
        'lead_audit_log',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('old_value', sa.JSON(), nullable=True),
        sa.Column('new_value', sa.JSON(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('meta', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
    )
    op.create_index('idx_audit_lead_id', 'lead_audit_log', ['lead_id'])
    op.create_index('idx_audit_created_at', 'lead_audit_log', ['created_at'])
    op.create_index('idx_audit_event_type', 'lead_audit_log', ['event_type'])


def downgrade() -> None:
    """Downgrade schema - drop all tables."""
    op.drop_index('idx_audit_event_type', table_name='lead_audit_log')
    op.drop_index('idx_audit_created_at', table_name='lead_audit_log')
    op.drop_index('idx_audit_lead_id', table_name='lead_audit_log')
    op.drop_table('lead_audit_log')
    
    op.drop_index('idx_leads_updated_at', table_name='leads')
    op.drop_index('idx_leads_status', table_name='leads')
    op.drop_index('idx_leads_email', table_name='leads')
    op.drop_table('leads')
    
    op.drop_index('idx_users_username', table_name='users')
    op.drop_index('idx_users_email', table_name='users')
    op.drop_table('users')
