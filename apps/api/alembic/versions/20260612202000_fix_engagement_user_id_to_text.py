"""fix engagement user_id columns to Text to match auth_user.id (nanoid)

Revision ID: 20260612202000
Revises: 20260612160243
Create Date: 2026-06-12 20:20:00

better-auth generates nanoid strings as user IDs, not UUIDs.
Aligns artifact_view/artifact_vote/artifact_comment user_id columns.
"""

import sqlalchemy as sa

from alembic import op

revision = "20260612202000"
down_revision = "20260612160243"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("artifact_view", "user_id", type_=sa.Text(), existing_nullable=True)
    op.alter_column("artifact_vote", "user_id", type_=sa.Text(), existing_nullable=False)
    op.alter_column("artifact_comment", "user_id", type_=sa.Text(), existing_nullable=False)


def downgrade() -> None:
    op.alter_column(
        "artifact_comment",
        "user_id",
        type_=sa.Uuid(),
        existing_nullable=False,
        postgresql_using="user_id::uuid",
    )
    op.alter_column(
        "artifact_vote",
        "user_id",
        type_=sa.Uuid(),
        existing_nullable=False,
        postgresql_using="user_id::uuid",
    )
    op.alter_column(
        "artifact_view",
        "user_id",
        type_=sa.Uuid(),
        existing_nullable=True,
        postgresql_using="user_id::uuid",
    )
