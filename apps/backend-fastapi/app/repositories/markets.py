from uuid import UUID
from app.db import get_supabase_client


def list_markets(jwt: str):
    """
    Returns all markets visible to the current user.
    Visibility is enforced entirely by Supabase RLS.
    """
    supabase = get_supabase_client(jwt)

    res = (
        supabase
        .table("markets")
        .select("*")
        .order("created_at", desc=False)
        .execute()
    )

    return res.data


def get_market_by_id(jwt: str, market_id: UUID):
    """
    Fetch a single market.
    RLS ensures access control.
    Returns None if not found or not allowed.
    """
    supabase = get_supabase_client(jwt)

    res = (
        supabase
        .table("markets")
        .select("*")
        .eq("id", str(market_id))
        .limit(1)
        .execute()
    )

    if not res.data:
        return None

    return res.data[0]


