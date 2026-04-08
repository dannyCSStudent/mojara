from supabase import create_client, ClientOptions

from app.config import settings



# -------------------------------------------------
# 🔐 User Client (Respects RLS)
# -------------------------------------------------
def get_user_client(jwt: str):
    """
    Uses anon key + injects user JWT.
    This respects RLS policies.
    """
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be configured")

    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
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
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured")

    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
    )
