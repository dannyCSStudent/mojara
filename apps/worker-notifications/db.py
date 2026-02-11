import os
import ssl
import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")


async def get_db():
    """
    Create a secure asyncpg connection to Supabase.
    Uses SSL (required by Supabase pooler).
    """

    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    try:
        conn = await asyncpg.connect(
            DATABASE_URL,
            ssl=ssl_context,
        )
        print("✅ Connected to database")
        return conn
    except Exception as e:
        print("❌ Database connection failed")
        print(e)
        raise
