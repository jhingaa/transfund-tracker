"""One-off schema sync helper. Adds missing columns without dropping data."""
from database import engine
from sqlalchemy import text

STATEMENTS = [
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date TIMESTAMP",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date TIMESTAMP",
    "ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_id INTEGER REFERENCES donors(id)",
    "ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_method VARCHAR",
    "ALTER TABLE donations ADD COLUMN IF NOT EXISTS transaction_id VARCHAR",
    "ALTER TABLE donations ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'completed'",
]

if __name__ == "__main__":
    with engine.begin() as conn:
        for s in STATEMENTS:
            conn.execute(text(s))
    print("Schema sync complete.")
