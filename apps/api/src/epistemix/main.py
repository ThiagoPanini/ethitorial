"""epistemix API — application entrypoint."""

from fastapi import FastAPI

from epistemix.db import ping_db

app = FastAPI(title="epistemix API", version="0.0.0")


@app.get("/health")
async def health() -> dict[str, str]:
    """Liveness + readiness probe. Returns db status alongside service status."""
    db_status = await ping_db()
    return {"status": "ok", "db": db_status}
