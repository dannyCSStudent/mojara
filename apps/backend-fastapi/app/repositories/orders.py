from app.db import get_supabase_client
from fastapi import HTTPException
from postgrest.exceptions import APIError


def create_order(
    jwt: str,
    market_id: str,
    vendor_id: str,
    user_id: str,
    items: list[dict],
):
    supabase = get_supabase_client(jwt)

    res = supabase.rpc(
        "create_order_atomic",
        {
            "p_market_id": market_id,
            "p_vendor_id": vendor_id,
            "p_user_id": user_id,
            "p_items": items,  # [{ product_id, quantity }]
        },
    ).execute()

    if not res.data:
        raise HTTPException(
            status_code=400,
            detail="Order creation failed",
        )
    print("RPC response:", res.data)

    return res.data

def get_order_by_id(jwt: str, order_id: str):
    supabase = get_supabase_client(jwt)

    res = (
        supabase
        .table("orders")
        .select(
            """
            id,
            market_id,
            vendor_id,
            user_id,
            status,
            created_at,
            order_items (
                product_id,
                quantity
            )
            """
        )
        .eq("id", order_id)
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    order = res.data
    order["items"] = order.pop("order_items", [])

    return order


def confirm_order(jwt: str, order_id: str):
    supabase = get_supabase_client(jwt)

    try:
        res = supabase.rpc(
            "confirm_order_atomic",
            {"p_order_id": order_id},
        ).execute()
    except APIError as e:
        if "not pending" in e.message.lower():
            raise HTTPException(
                status_code=409,
                detail="Order is not in a confirmable state",
            )
        raise

    return res.data


def cancel_order(jwt: str, order_id: str):
    supabase = get_supabase_client(jwt)

    res = supabase.rpc(
        "cancel_order_atomic",
        {"p_order_id": order_id},
    ).execute()

    if not res.data or len(res.data) == 0:
        raise HTTPException(
            status_code=400,
            detail="Order cancellation failed",
        )

    return res.data
