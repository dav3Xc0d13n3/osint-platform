# Default Admin User
"""create_default_admin

Revision ID: 002
Revises: 001
Create Date: 2026-11-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from passlib.context import CryptContext

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def upgrade() -> None:
    # Hash the default password "admin"
    hashed_password = pwd_context.hash("admin")
    
    # Insert default admin user
    op.execute(
        sa.text("""
            INSERT INTO admin_users (id, username, email, password_hash, full_name, is_active, is_superuser, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                'admin',
                'admin@example.com',
                :password_hash,
                'Default Admin',
                true,
                true,
                now(),
                now()
            )
            ON CONFLICT (username) DO NOTHING
        """),
        {"password_hash": hashed_password}
    )

def downgrade() -> None:
    op.execute("DELETE FROM admin_users WHERE username = 'admin'")