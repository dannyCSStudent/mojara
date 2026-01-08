import os
from supabase import create_client, ClientOptions
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_supabase_client(jwt: str):
    return create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        ClientOptions(
            headers={
                "Authorization": f"Bearer {jwt}",
            }
        ),
    )
