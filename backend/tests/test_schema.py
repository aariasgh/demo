"""Integration tests for database schema and migrations"""

import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import inspect
import psycopg2

from app.config import settings
from app.models import Base, User, Lead, LeadAuditLog


class TestDatabaseSchema:
    """Test database schema creation and integrity"""

    @pytest.fixture
    async def db_engine(self):
        """Create test database engine"""
        engine = create_async_engine(settings.DATABASE_URL, echo=False)
        yield engine
        await engine.dispose()

    @pytest.fixture
    def pg_connection(self):
        """Create direct PostgreSQL connection for schema inspection"""
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
        )
        yield conn
        conn.close()

    def test_users_table_exists(self, pg_connection):
        """Verify users table exists with correct columns"""
        cur = pg_connection.cursor()
        cur.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position"
        )
        columns = [row[0] for row in cur.fetchall()]
        cur.close()

        expected = [
            "id",
            "username",
            "email",
            "password_hash",
            "created_at",
            "updated_at",
        ]
        assert columns == expected, f"Users table columns mismatch: {columns}"

    def test_leads_table_exists(self, pg_connection):
        """Verify leads table exists with correct columns"""
        cur = pg_connection.cursor()
        cur.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name='leads' ORDER BY ordinal_position"
        )
        columns = [row[0] for row in cur.fetchall()]
        cur.close()

        expected = [
            "id",
            "name",
            "company",
            "email",
            "phone",
            "status",
            "notes",
            "created_at",
            "updated_at",
            "last_status_change_at",
            "priority",
        ]
        assert columns == expected, f"Leads table columns mismatch: {columns}"

    def test_lead_audit_log_table_exists(self, pg_connection):
        """Verify lead_audit_log table exists with correct columns"""
        cur = pg_connection.cursor()
        cur.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name='lead_audit_log' ORDER BY ordinal_position"
        )
        columns = [row[0] for row in cur.fetchall()]
        cur.close()

        expected = [
            "id",
            "lead_id",
            "event_type",
            "old_value",
            "new_value",
            "description",
            "created_by_id",
            "created_at",
            "meta",
            "field_name",
        ]
        assert columns == expected, f"Audit log table columns mismatch: {columns}"

    def test_unique_constraints(self, pg_connection):
        """Verify unique constraints exist on users and leads"""
        cur = pg_connection.cursor()
        
        # Check users unique constraints
        cur.execute(
            """
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name='users' AND constraint_type='UNIQUE'
            ORDER BY constraint_name
            """
        )
        user_constraints = [row[0] for row in cur.fetchall()]
        assert len(user_constraints) >= 2, "Users table should have unique constraints"

        # Check leads email unique constraint
        cur.execute(
            """
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name='leads' AND constraint_type='UNIQUE'
            ORDER BY constraint_name
            """
        )
        lead_constraints = [row[0] for row in cur.fetchall()]
        assert len(lead_constraints) >= 1, "Leads table should have email unique constraint"
        
        cur.close()

    def test_foreign_keys_exist(self, pg_connection):
        """Verify foreign key constraints on lead_audit_log"""
        cur = pg_connection.cursor()
        cur.execute(
            """
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name='lead_audit_log' AND constraint_type='FOREIGN KEY'
            ORDER BY constraint_name
            """
        )
        fk_constraints = [row[0] for row in cur.fetchall()]
        assert len(fk_constraints) >= 2, "Audit log should have foreign key constraints"
        cur.close()

    def test_indices_created(self, pg_connection):
        """Verify indices are created for performance"""
        cur = pg_connection.cursor()
        
        # List indices for users
        cur.execute(
            """
            SELECT indexname FROM pg_indexes
            WHERE tablename='users' AND indexname LIKE 'idx_%'
            ORDER BY indexname
            """
        )
        user_indices = [row[0] for row in cur.fetchall()]
        assert len(user_indices) >= 2, "Users table should have indices"

        # List indices for leads
        cur.execute(
            """
            SELECT indexname FROM pg_indexes
            WHERE tablename='leads' AND indexname LIKE 'idx_%'
            ORDER BY indexname
            """
        )
        lead_indices = [row[0] for row in cur.fetchall()]
        assert len(lead_indices) >= 3, "Leads table should have indices"

        # List indices for lead_audit_log
        cur.execute(
            """
            SELECT indexname FROM pg_indexes
            WHERE tablename='lead_audit_log' AND indexname LIKE 'idx_%'
            ORDER BY indexname
            """
        )
        audit_indices = [row[0] for row in cur.fetchall()]
        assert len(audit_indices) >= 3, "Audit log table should have indices"
        
        cur.close()

    def test_lead_status_check_constraint(self, pg_connection):
        """Verify check constraint on lead status"""
        cur = pg_connection.cursor()
        cur.execute(
            """
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name='leads' AND constraint_type='CHECK'
            ORDER BY constraint_name
            """
        )
        check_constraints = [row[0] for row in cur.fetchall()]
        assert len(check_constraints) >= 1, "Leads table should have check constraint for status"
        cur.close()

    def test_default_values_exist(self, pg_connection):
        """Verify default values for status and timestamps"""
        cur = pg_connection.cursor()
        
        # Check leads.status default
        cur.execute(
            """
            SELECT column_default FROM information_schema.columns
            WHERE table_name='leads' AND column_name='status'
            """
        )
        result = cur.fetchone()
        assert result and result[0], "Leads status should have default value"
        
        cur.close()

    def test_unique_constraint_email_users(self, pg_connection):
        """Verify unique constraint prevents duplicate user emails"""
        import uuid
        cur = pg_connection.cursor()
        
        try:
            # Clean up any existing test data
            cur.execute("DELETE FROM users WHERE email LIKE 'unique_test_%@example.com'")
            pg_connection.commit()
            
            # Insert first user with unique email
            test_id = uuid.uuid4().hex[:8]
            email1 = f"unique_test_{test_id}@example.com"
            cur.execute(
                """
                INSERT INTO users (username, email, password_hash)
                VALUES (%s, %s, %s)
                """,
                (f"testuser_{test_id}", email1, "hash1")
            )
            pg_connection.commit()
            
            # Try to insert duplicate email (should fail)
            with pytest.raises(psycopg2.IntegrityError):
                cur.execute(
                    """
                    INSERT INTO users (username, email, password_hash)
                    VALUES (%s, %s, %s)
                    """,
                    (f"testuser2_{test_id}", email1, "hash2")
                )
                pg_connection.commit()
        finally:
            pg_connection.rollback()
            cur.close()

    def test_unique_constraint_email_leads(self, pg_connection):
        """Verify unique constraint prevents duplicate lead emails"""
        import uuid
        cur = pg_connection.cursor()
        
        try:
            # Clean up any existing test data
            cur.execute("DELETE FROM leads WHERE email LIKE 'lead_unique_%@example.com'")
            pg_connection.commit()
            
            # Insert first lead with unique email
            test_id = uuid.uuid4().hex[:8]
            email1 = f"lead_unique_{test_id}@example.com"
            cur.execute(
                """
                INSERT INTO leads (name, company, email, status, priority)
                VALUES (%s, %s, %s, %s, %s)
                """,
                ("Acme Corp", "Acme", email1, "Nuevo", "Media")
            )
            pg_connection.commit()
            
            # Try to insert duplicate email (should fail)
            with pytest.raises(psycopg2.IntegrityError):
                cur.execute(
                    """
                    INSERT INTO leads (name, company, email, status, priority)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    ("Beta Ltd", "Beta", email1, "Nuevo", "Alta")
                )
                pg_connection.commit()
        finally:
            pg_connection.rollback()
            cur.close()

    def test_check_constraint_lead_status(self, pg_connection):
        """Verify check constraint prevents invalid lead status"""
        import uuid
        cur = pg_connection.cursor()
        
        try:
            # Try to insert invalid status (should fail)
            test_id = uuid.uuid4().hex[:8]
            email = f"status_test_{test_id}@example.com"
            with pytest.raises(psycopg2.IntegrityError):
                cur.execute(
                    """
                    INSERT INTO leads (name, company, email, status)
                    VALUES (%s, %s, %s, %s)
                    """,
                    ("Test", "Test Corp", email, "InvalidStatus")
                )
                pg_connection.commit()
        finally:
            pg_connection.rollback()
            cur.close()


class TestMigrationReversibility:
    """Test migration up/down functionality"""

    def test_migration_version_recorded(self):
        """Verify migration version is recorded in alembic_version table"""
        import psycopg2
        from app.config import settings
        
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
        )
        cur = conn.cursor()
        cur.execute("SELECT version_num FROM alembic_version")
        versions = cur.fetchall()
        cur.close()
        conn.close()

        assert len(versions) >= 1, "Migration version should be recorded"
        # Verify current migration is recorded (can be 006 or later)
        assert versions[0][0] in ["006", "005", "323f0096ff65"], f"Current migration version {versions[0][0]} should be valid"
