import sys
sys.path.insert(0, ".")

from database import engine, Base
import models  # registers all models

Base.metadata.create_all(bind=engine)
print("All tables created successfully.")

import psycopg2
conn = psycopg2.connect(host="localhost", port=5432, dbname="mini", user="postgres", password="1234")
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
print("Tables in DB:", [r[0] for r in cur.fetchall()])
conn.close()
