from app.db import get_user_client
from uuid import UUID


# -----------------------------
# List vendors (RLS controlled)
# -----------------------------
def get_vendors(jwt: str):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("vendors")
        .select("*")
        .order("created_at", desc=False)
        .execute()
    )

    return res.data or []


# -----------------------------
# Get single vendor
# -----------------------------
def get_vendor(vendor_id: UUID, jwt: str):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("vendors")
        .select("*")
        .eq("id", str(vendor_id))
        .single()
        .execute()
    )

    return res.data


# -----------------------------
# Create vendor
# -----------------------------
def create_vendor(jwt: str, payload: dict):
    """
    RLS ensures:
      - Only market admins can insert
      - Must belong to market
    """
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("vendors")
        .insert(payload)
        .execute()
    )

    if not res.data:
        return None

    return res.data[0]


# -----------------------------
# Update vendor
# -----------------------------
def update_vendor(jwt: str, vendor_id: UUID, updates: dict):
    """
    RLS ensures:
      - Only market admins can update
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


# -----------------------------
# Delete vendor
# -----------------------------
def delete_vendor(jwt: str, vendor_id: UUID):
    """
    RLS ensures:
      - Only market admins can delete
    """
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("vendors")
        .delete()
        .eq("id", str(vendor_id))
        .execute()
    )

    if not res.data:
        return None

    return True


# -----------------------------
# Vendors by market
# -----------------------------
def list_vendors_for_market(jwt: str, market_id: UUID):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("vendors")
        .select("*")
        .eq("market_id", str(market_id))
        .order("created_at", desc=False)
        .execute()
    )

    return res.data or []
