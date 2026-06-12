"""Tests for the initial engagement migration.

Uses aiosqlite + a temp SQLite file to run upgrade/downgrade without Postgres.
These are NOT marked integration — SQLite covers the structural invariants.
"""


import pytest
from sqlalchemy import create_engine, inspect


@pytest.fixture()
def sqlite_alembic_config(tmp_path):
    db_file = tmp_path / "test.db"
    db_url = f"sqlite+aiosqlite:///{db_file}"
    sync_url = f"sqlite:///{db_file}"

    from alembic.config import Config
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", db_url)
    cfg.set_main_option("script_location", "alembic")
    return cfg, sync_url


def test_upgrade_creates_engagement_tables(sqlite_alembic_config) -> None:
    """Upgrade creates all three engagement tables with correct columns."""
    from alembic import command
    cfg, sync_url = sqlite_alembic_config

    command.upgrade(cfg, "head")

    engine = create_engine(sync_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    assert "artifact_view" in tables
    assert "artifact_vote" in tables
    assert "artifact_comment" in tables

    view_cols = {c["name"] for c in inspector.get_columns("artifact_view")}
    assert {"id", "artifact_id", "session_id", "day_bucket_utc", "user_id",
            "referrer_kind", "country_code", "created_at"} <= view_cols

    vote_cols = {c["name"] for c in inspector.get_columns("artifact_vote")}
    assert {"id", "artifact_id", "user_id", "created_at"} <= vote_cols

    comment_cols = {c["name"] for c in inspector.get_columns("artifact_comment")}
    assert {"id", "artifact_id", "user_id", "body", "created_at",
            "updated_at", "moderated_at"} <= comment_cols

    engine.dispose()


def test_downgrade_removes_engagement_tables(sqlite_alembic_config) -> None:
    """Downgrade to base removes all three engagement tables."""
    from alembic import command
    cfg, sync_url = sqlite_alembic_config

    command.upgrade(cfg, "head")
    command.downgrade(cfg, "base")

    engine = create_engine(sync_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    assert "artifact_view" not in tables
    assert "artifact_vote" not in tables
    assert "artifact_comment" not in tables

    engine.dispose()
