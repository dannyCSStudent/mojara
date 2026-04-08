from app.db import get_user_client


def list_inventory_events(
    jwt: str,
    market_id: str,
    vendor_id: str,
    product_id: str,
    limit: int = 10,
):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("inventory_events")
        .select("*")
        .eq("market_id", market_id)
        .eq("vendor_id", vendor_id)
        .eq("product_id", product_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return res.data or []
