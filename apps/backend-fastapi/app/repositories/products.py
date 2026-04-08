from app.db import get_user_client
from app.schemas.products import ProductBulkUpdateItem
from typing import List
from fastapi import HTTPException
from postgrest import APIError

def list_products(jwt: str):
    supabase = get_user_client(jwt)
    res = supabase.table("products").select("*").execute()
    return res.data


def get_product_by_id(jwt: str, product_id: str):
    supabase = get_user_client(jwt)
    try:
        res = (
            supabase
            .table("products")
            .select("*")
            .eq("id", product_id)
            .limit(1)
            .execute()
        )
    except APIError:
        return None

    if not res.data:
        return None

    return res.data[0]


def create_product(jwt: str, payload: dict):
    supabase = get_user_client(jwt)
    res = supabase.table("products").insert(payload).execute()
    return res.data[0]


def update_product(jwt: str, product_id: str, updates: dict):
    supabase = get_user_client(jwt)
    res = (
        supabase
        .table("products")
        .update(updates)
        .eq("id", product_id)
        .execute()
    )
    return res.data[0] if res.data else None


def delete_product(jwt: str, product_id: str):
    supabase = get_user_client(jwt)
    res = (
        supabase
        .table("products")
        .delete()
        .eq("id", product_id)
        .execute()
    )
    return bool(res.data)


def get_products_for_vendor(
    jwt: str,
    market_id: str,
    vendor_id: str,
    *,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort: str = "name",
):
    supabase = get_user_client(jwt)

    query = (
        supabase
        .table("products")
        .select(
            """
            id,
            name,
            price,
            active,
            stock_quantity,
            is_available,
            vendor_id,
            created_at,
            vendor:vendors!inner (
                id,
                market_id
            )
            """
        )
        .eq("vendor_id", vendor_id)
        .eq("vendors.market_id", market_id)
    )

    if search:
        query = query.ilike("name", f"%{search}%")

    if min_price is not None:
        query = query.gte("price", min_price)

    if max_price is not None:
        query = query.lte("price", max_price)

    if sort == "price_asc":
        query = query.order("price", desc=False).order("name", desc=False)
    elif sort == "price_desc":
        query = query.order("price", desc=True).order("name", desc=False)
    else:
        query = query.order("name", desc=False)

    res = query.execute()

    return res.data


def create_product_for_vendor(
    jwt: str,
    market_id: str,
    vendor_id: str,
    payload: dict,
):
    supabase = get_user_client(jwt)

    data = {
        **payload,
        "market_id": market_id,
        "vendor_id": vendor_id,
    }

    res = (
        supabase
        .table("products")
        .insert(data)
        .execute()
    )

    return res.data[0] if res.data else None


def update_product_for_vendor(
    jwt: str,
    market_id: str,
    vendor_id: str,
    product_id: str,
    updates: dict,
):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("products")
        .update(updates)
        .eq("id", product_id)
        .eq("vendor_id", vendor_id)
        .eq("market_id", market_id)
        .execute()
    )

    return res.data[0] if res.data else None


def delete_product_for_vendor(
    jwt: str,
    market_id: str,
    vendor_id: str,
    product_id: str,
):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("products")
        .delete()
        .eq("id", product_id)
        .eq("vendor_id", vendor_id)
        .eq("market_id", market_id)
        .execute()
    )

    return bool(res.data)


def create_products_for_vendor_bulk(
    jwt: str,
    market_id: str,
    vendor_id: str,
    products: list[dict],
):
    supabase = get_user_client(jwt)

    payload = [
        {
            **product,
            "vendor_id": vendor_id,
            "market_id": market_id,
        }
        for product in products
    ]

    res = (
        supabase
        .table("products")
        .insert(payload)
        .execute()
    )

    return res.data


def bulk_update_products_for_vendor(
    jwt: str,
    vendor_id: str,
    products: list[dict],
):
    supabase = get_user_client(jwt)
    updated = []

    for item in products:
        product_id = item.pop("id", None)

        if not product_id or not item:
            continue

        res = (
            supabase
            .table("products")
            .update(item)
            .eq("id", product_id)
            .eq("vendor_id", vendor_id)  # 🔐 ownership guard
            .execute()
        )

        if res.data:
            updated.append(res.data[0])

    return updated


def update_product_inventory(
    jwt: str,
    market_id: str,
    vendor_id: str,
    product_id: str,
    updates: dict,
):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("products")
        .update(updates)
        .eq("id", product_id)
        .eq("vendor_id", vendor_id)
        .eq("market_id", market_id)
        .execute()
    )

    return res.data[0] if res.data else None


def decrement_inventory(
    jwt: str,
    product_id: str,
    vendor_id: str,
    market_id: str,
    quantity: int,
):
    supabase = get_user_client(jwt)

    res = supabase.rpc(
        "decrement_product_inventory",
        {
            "p_product_id": product_id,
            "p_vendor_id": vendor_id,
            "p_market_id": market_id,
            "p_quantity": quantity,
        },
    ).execute()

    if not res.data:
        raise HTTPException(
            status_code=409,
            detail="Insufficient stock",
        )

    return res.data[0]
