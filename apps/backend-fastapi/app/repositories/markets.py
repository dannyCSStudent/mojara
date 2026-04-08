from uuid import UUID
from app.db import get_user_client


def list_markets(
    jwt: str,
    *,
    search: str | None = None,
):
    """
    Returns all markets visible to the current user.
    Visibility is enforced entirely by Supabase RLS.
    """
    supabase = get_user_client(jwt)

    query = (
        supabase
        .table("markets")
        .select("*")
    )

    if search:
        query = query.or_(
            f"name.ilike.%{search}%,location.ilike.%{search}%"
        )

    res = query.order("created_at", desc=False).execute()

    return res.data


def get_market_by_id(jwt: str, market_id: UUID):
    """
    Fetch a single market.
    RLS ensures access control.
    Returns None if not found or not allowed.
    """
    supabase = get_user_client(jwt)

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

