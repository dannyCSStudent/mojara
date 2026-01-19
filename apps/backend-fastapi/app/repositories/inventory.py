from fastapi import HTTPException
from app.db import get_supabase_client
from postgrest.exceptions import APIError


def reserve_inventory(
    jwt: str,
    product_id: str,
    order_id: str,
    quantity: int,
):
    supabase = get_supabase_client(jwt)

    try:
        res = supabase.rpc(
            "reserve_inventory",
            {
                "p_product_id": product_id,
                "p_order_id": order_id,
                "p_quantity": quantity,
            },
        ).execute()
    except APIError as e:
        # This RPC intentionally throws on insufficient stock
        raise HTTPException(
            status_code=409,
            detail="Insufficient stock",
        )

    return res.data
