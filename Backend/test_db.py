import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("DB URL:", DATABASE_URL)

engine = create_engine(DATABASE_URL)

print("Connecting...")
with engine.connect() as conn:
    print("Connected")
    print(conn.execute(text("SELECT 1")).fetchall())

print("Done")
