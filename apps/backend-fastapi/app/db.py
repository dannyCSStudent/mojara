import os
from dotenv import load_dotenv
from supabase import create_client, ClientOptions

load_dotenv()  # <-- MUST BE HERE

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")



# -------------------------------------------------
# 🔐 User Client (Respects RLS)
# -------------------------------------------------
def get_user_client(jwt: str):
    """
    Uses anon key + injects user JWT.
    This respects RLS policies.
    """
    return create_client(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        ClientOptions(
            headers={
                "Authorization": f"Bearer {jwt}",
            }
        ),
    )


# -------------------------------------------------
# 🛡 Service Client (Bypasses RLS)
# -------------------------------------------------
def get_service_client():
    """
    Full admin client.
    Bypasses RLS.
    """
    return create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
    )
