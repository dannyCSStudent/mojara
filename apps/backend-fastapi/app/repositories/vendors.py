from app.db import get_user_client
from uuid import UUID


def get_vendors(jwt):
    supabase = get_user_client(jwt)
    res = supabase.table("vendors").select("*").execute()
    return res.data


def get_vendor(vendor_id: str, jwt):
    supabase = get_user_client(jwt)
    res = (
        supabase.table("vendors")
        .select("*")
        .eq("id", vendor_id)
        .single()
        .execute()
    )
    return res.data


def create_vendor(
    jwt: str,
    *,
    market_id: UUID,
    name: str,
):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("vendors")
        .insert(
            {
                "market_id": str(market_id),
                "name": name,
            }
        )
        .execute()
    )

    if not res.data:
        return None

    return res.data[0]


def update_vendor(
    jwt: str,
    *,
    vendor_id: UUID,
    updates: dict,
):
    """
    Update a vendor.
    RLS ensures user has permission via market membership.
    """
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("vendors")
        .update(updates)
        .eq("id", str(vendor_id))
        .execute()
    )

    if not res.data:
        return None

    return res.data[0]


def delete_vendor(vendor_id: str, jwt):
    supabase = get_user_client(jwt)
    supabase.table("vendors").delete().eq("id", vendor_id).execute()
    return {"status": "deleted"}


def list_vendors_for_market(jwt: str, market_id: UUID):
    """
    Returns vendors for a given market.
    RLS ensures:
      - user belongs to market
      - admin visibility rules
    """
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("vendors")
        .select("*")
        .eq("market_id", str(market_id))
        .order("created_at", desc=False)
        .execute()
    )

    return res.data