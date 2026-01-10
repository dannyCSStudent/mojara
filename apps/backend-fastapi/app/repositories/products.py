from app.db import get_supabase_client
from app.schemas.products import ProductBulkUpdateItem
from typing import List
from fastapi import HTTPException

def list_products(jwt: str):
    supabase = get_supabase_client(jwt)
    res = supabase.table("products").select("*").execute()
    return res.data


def get_product_by_id(jwt: str, product_id: str):
    supabase = get_supabase_client(jwt)
    res = (
        supabase
        .table("products")
        .select("*")
        .eq("id", product_id)
        .single()
        .execute()
    )
    return res.data


def create_product(jwt: str, payload: dict):
    supabase = get_supabase_client(jwt)
    res = supabase.table("products").insert(payload).execute()
    return res.data[0]


def update_product(jwt: str, product_id: str, updates: dict):
    supabase = get_supabase_client(jwt)
    res = (
        supabase
        .table("products")
        .update(updates)
        .eq("id", product_id)
        .execute()
    )
    return res.data[0] if res.data else None


def delete_product(jwt: str, product_id: str):
    supabase = get_supabase_client(jwt)
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
):
    supabase = get_supabase_client(jwt)

    res = (
        supabase
        .table("products")
        .select(
            """
            id,
            name,
            price,
            created_at,
            vendor:vendors!inner (
                id,
                market_id
            )
            """
        )
        .eq("vendor_id", vendor_id)
        .eq("vendors.market_id", market_id)
        .execute()
    )

    return res.data


def create_product_for_vendor(
    jwt: str,
    market_id: str,
    vendor_id: str,
    payload: dict,
):
    supabase = get_supabase_client(jwt)

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
    supabase = get_supabase_client(jwt)

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
    supabase = get_supabase_client(jwt)

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
    supabase = get_supabase_client(jwt)

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
    supabase = get_supabase_client(jwt)
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
    supabase = get_supabase_client(jwt)

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
    supabase = get_supabase_client(jwt)

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


