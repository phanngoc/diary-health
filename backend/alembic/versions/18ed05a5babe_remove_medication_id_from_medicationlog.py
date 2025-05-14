"""remove_medication_id_from_medicationlog

Revision ID: 18ed05a5babe
Revises: fbb86279fc2b
Create Date: 2025-05-14 10:44:00.597904

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '18ed05a5babe'
down_revision: Union[str, None] = 'fbb86279fc2b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Remove medication_id column from medicationlog table
    # We'll drop the column only if it exists
    with op.batch_alter_table('medicationlog') as batch_op:
        batch_op.drop_column('medication_id')


def downgrade() -> None:
    """Downgrade schema."""
    # Add medication_id column back to medicationlog table
    with op.batch_alter_table('medicationlog') as batch_op:
        batch_op.add_column(sa.Column('medication_id', sa.Integer(), nullable=True))
    
    # Add foreign key constraint
    with op.batch_alter_table('medicationlog') as batch_op:
        batch_op.create_foreign_key(
            'fk_medicationlog_medication_id',
            'medication',
            ['medication_id'],
            ['id']
        )
