# Default Admin User
"""create_default_admin

Revision ID: 002
Revises: 001
Create Date: 2026-11-14

"""
import os
import logging
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from passlib.context import CryptContext

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

# Use same pwd_context as app/core/security.py for consistency
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Read password from env var with fallback for local dev only
DEFAULT_ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
if DEFAULT_ADMIN_PASSWORD == "admin":
    logging.warning("Using default admin password 'admin'. Set ADMIN_PASSWORD env var in production!")

def upgrade() -> None:
    # Check if admin user already exists
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT 1 FROM admin_users WHERE username = 'admin'"))
    if result.fetchone():
        logging.info("Default admin user 'admin' already exists, skipping creation")
        return

    # Hash the password
    hashed_password = pwd_context.hash(DEFAULT_ADMIN_PASSWORD)
    
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
    logging.info("Default admin user 'admin' created successfully")

def downgrade() -> None:
    op.execute("DELETE FROM admin_users WHERE username = 'admin'")