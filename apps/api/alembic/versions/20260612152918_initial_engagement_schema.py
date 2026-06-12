"""initial engagement schema

Revision ID: 20260612152918
Revises:
Create Date: 2026-06-12 15:29:18

Creates artifact_view, artifact_vote and artifact_comment tables for the
engagement boundary. Domain invariants encoded as unique constraints:
  - artifact_view: (artifact_id, session_id, day_bucket_utc) — dedup per session/day
  - artifact_vote: (artifact_id, user_id) — one vote per user per artifact
"""

import sqlalchemy as sa

from alembic import op

revision = "20260612152918"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "artifact_view",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("artifact_id", sa.String(255), nullable=False),
        sa.Column("session_id", sa.String(255), nullable=False),
        sa.Column("day_bucket_utc", sa.Date(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("referrer_kind", sa.String(64), nullable=True),
        sa.Column("country_code", sa.String(2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("artifact_id", "session_id", "day_bucket_utc", name="uq_view_dedup"),
    )
    op.create_index("ix_artifact_view_artifact_id", "artifact_view", ["artifact_id"])

    op.create_table(
        "artifact_vote",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("artifact_id", sa.String(255), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("artifact_id", "user_id", name="uq_vote_per_user"),
    )
    op.create_index("ix_artifact_vote_artifact_id", "artifact_vote", ["artifact_id"])
    op.create_index("ix_artifact_vote_user_id", "artifact_vote", ["user_id"])

    op.create_table(
        "artifact_comment",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("artifact_id", sa.String(255), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("moderated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_artifact_comment_artifact_id", "artifact_comment", ["artifact_id"])
    op.create_index("ix_artifact_comment_user_id", "artifact_comment", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_artifact_comment_user_id", table_name="artifact_comment")
    op.drop_index("ix_artifact_comment_artifact_id", table_name="artifact_comment")
    op.drop_table("artifact_comment")

    op.drop_index("ix_artifact_vote_user_id", table_name="artifact_vote")
    op.drop_index("ix_artifact_vote_artifact_id", table_name="artifact_vote")
    op.drop_table("artifact_vote")

    op.drop_index("ix_artifact_view_artifact_id", table_name="artifact_view")
    op.drop_table("artifact_view")
