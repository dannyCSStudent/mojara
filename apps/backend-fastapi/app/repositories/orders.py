from app.db import get_supabase_client
from fastapi import HTTPException
from postgrest import APIError
import httpx


# =========================
# Queries
# =========================

def get_orders_for_user(jwt: str, user_id: str):
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
            total,
            created_at,
            order_items (
                product_id,
                quantity,
                unit_price,
                products ( name )
            )
            """
        )
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return _normalize_orders(res.data)


def get_orders_for_vendor(jwt: str, vendor_id: str):
    supabase = get_supabase_client(jwt)

    try:
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
                total,
                created_at,
                order_items:order_items!order_items_order_id_fkey (
                    product_id,
                    quantity,
                    products ( 
                        name,
                        price
                    )
                )
                """
            )
            .eq("vendor_id", vendor_id)
            .order("created_at", desc=True)
            .execute()
        )
    except httpx.ConnectError:
        raise HTTPException(503, "Database unavailable")
    except APIError as e:
        raise HTTPException(500, str(e))

    return _normalize_orders(res.data)


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
        total,
        created_at,
        order_items (
            product_id,
            quantity,
            unit_price,
            line_total,
            products ( name )
        ),
        refunds (
            id,
            amount,
            reason,
            created_at
        )
        """
    )
    .eq("id", order_id)
    .single()
    .execute()
    )
    if not res.data:
        raise HTTPException(404, "Order not found")

    return _normalize_order(res.data)


# =========================
# Vendor resolution
# =========================

def get_vendor_id_for_user(jwt: str, user_id: str) -> str:
    supabase = get_supabase_client(jwt)
    
    res = (
        supabase
        .table("vendors")
        .select("id")
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(403, "User is not a vendor")

    return res.data["id"]


# =========================
# Mutations
# =========================

def create_order(jwt, market_id, vendor_id, customer_id, items):
    supabase = get_supabase_client(jwt)
    
    res = supabase.rpc(
        "create_order_atomic",
        {
            "p_market_id": market_id,
            "p_vendor_id": vendor_id,
            "p_customer_id": customer_id,
            "p_items": items,
        },
    ).execute()

    if not res.data:
        raise HTTPException(400, "Order creation failed")

    return res.data


def confirm_order(jwt: str, order_id: str, vendor_id: str):
    supabase = get_supabase_client(jwt)

    res = supabase.rpc(
        "confirm_order_atomic",
        {
            "p_order_id": order_id,
            "p_vendor_id": vendor_id,
        },
    ).execute()

    if not res.data:
        raise HTTPException(409, "Order cannot be confirmed")

    return res.data


def cancel_order(jwt: str, order_id: str, vendor_id: str):
    supabase = get_supabase_client(jwt)

    res = supabase.rpc(
        "cancel_order_atomic",
        {
            "p_order_id": order_id,
            "p_vendor_id": vendor_id,
        },
    ).execute()

    if not res.data:
        raise HTTPException(409, "Order cannot be canceled")

    return res.data


# =========================
# Normalization
# =========================

def _normalize_orders(rows):
    return [_normalize_order(row) for row in rows or []]


def _normalize_order(order):
    items = [
        {
            "product_id": i["product_id"],
            "name": i["products"]["name"],
            "quantity": i["quantity"],
            "unit_price": i["unit_price"],
            "line_total": i.get("line_total")
                or i["quantity"] * i["unit_price"],
        }
        for i in order.get("order_items", [])
    ]

    refunds = [
        {
            "id": r["id"],
            "amount": r["amount"],
            "reason": r["reason"],
            "created_at": r["created_at"],
        }
        for r in order.get("refunds", [])
    ]

    refunded_total = sum(r["amount"] for r in refunds)

    return {
        **order,
        "items": items,
        "refunds": refunds,
        "refunded_total": refunded_total,
    }




# =========================
# Refunds
# =========================

def refund_order(jwt: str, order_id: str, amount: float, reason: str):
    supabase = get_supabase_client(jwt)

    res = supabase.rpc(
        "refund_order_atomic",
        {
            "p_order_id": order_id,
            "p_amount": amount,
            "p_reason": reason,
        },
    ).execute()

    if not res.data:
        raise HTTPException(409, "Refund failed")

    return res.data

