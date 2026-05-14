from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from sqlalchemy import text

from database import engine, Base
import models
from routers import campaigns, donations, donors, receipts, utilizations, admins, auth, campaign_updates

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

# Lightweight schema sync: add columns that were introduced after a table
# was first created. Avoids "UndefinedColumn" errors without needing Alembic.
_SCHEMA_SYNC_STATEMENTS = [
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date TIMESTAMP",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date TIMESTAMP",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS close_reason VARCHAR",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS daily_donor_limit FLOAT",
    "ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_id INTEGER REFERENCES donors(id)",
    "ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_method VARCHAR",
    "ALTER TABLE donations ADD COLUMN IF NOT EXISTS transaction_id VARCHAR",
    "ALTER TABLE donations ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'completed'",
]
try:
    with engine.begin() as _conn:
        for _stmt in _SCHEMA_SYNC_STATEMENTS:
            _conn.execute(text(_stmt))
except Exception as _e:
    print(f"[schema-sync] warning: {_e}")

app = FastAPI(title="Transfund Tracker API", version="1.0.0")

# Allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded campaign images
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(campaigns.router)
app.include_router(donations.router)
app.include_router(donors.router)
app.include_router(receipts.router)
app.include_router(utilizations.router)
app.include_router(admins.router)
app.include_router(auth.router)
app.include_router(campaign_updates.router)


@app.get("/health")
def health():
    return {"status": "ok", "message": "Transfund Tracker API is running"}
