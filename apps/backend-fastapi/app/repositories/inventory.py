from fastapi import HTTPException
from app.db import get_supabase_client


def reserve_inventory(
    jwt: str,
    product_id: str,
    order_id: str,
    quantity: int,
):
    supabase = get_supabase_client(jwt)

    res = supabase.rpc(
        "reserve_inventory",
        {
            "p_product_id": product_id,
            "p_order_id": order_id,
            "p_quantity": quantity,
        },
    ).execute()

    if res.error:
        raise HTTPException(
            status_code=409,
            detail="Insufficient stock",
        )
