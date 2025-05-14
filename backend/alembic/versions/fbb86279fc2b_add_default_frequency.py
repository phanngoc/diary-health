"""add_default_frequency

Revision ID: fbb86279fc2b
Revises: 
Create Date: 2025-05-14 09:50:54.349354

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fbb86279fc2b'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('medication', 'frequency', existing_type=sa.String(), nullable=True)
    # Seed user data
    op.execute(
        """
        INSERT INTO "user" (id, email, hashed_password, full_name, is_active, created_at, updated_at)
        VALUES (1, 'demo@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Demo User', true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('medication', 'frequency', existing_type=sa.String(), nullable=False)
