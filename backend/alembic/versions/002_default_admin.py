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
    # Ensure admin_users table exists (handles fresh DB and partially migrated DB)
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("admin_users"):
        logging.info("admin_users table missing, creating it now")
        op.create_table(
            'admin_users',
            sa.Column('id', UUID(as_uuid=True), primary_key=True),
            sa.Column('username', sa.String(50), unique=True, nullable=False),
            sa.Column('email', sa.String(100), unique=True, nullable=False),
            sa.Column('password_hash', sa.String(255), nullable=False),
            sa.Column('full_name', sa.String(100), nullable=True),
            sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
            sa.Column('is_superuser', sa.Boolean(), default=False, nullable=False),
            sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        )
        op.create_index('ix_admin_users_username', 'admin_users', ['username'], if_not_exists=True)
        op.create_index('ix_admin_users_email', 'admin_users', ['email'], if_not_exists=True)
        logging.info("Created admin_users table")
    
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