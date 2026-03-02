# routes/orders.py
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List

from app.core.dependencies import get_current_jwt, require_permissions, get_current_user
from app.schemas.orders import (
    CreateOrderPayload,
    OrderOut,
    OrderConfirmOut,
    RefundPayload,
    CursorPaginatedOrders,
)
from app.repositories.orders import (
    create_order,
    confirm_order,
    cancel_order,
    get_order_by_id,
    get_orders_for_user_cursor,
    get_orders_for_vendor_cursor,
    get_vendor_id_for_user,
    refund_order,
    get_orders_summary,
)

router = APIRouter(tags=["orders"])

# ==========================================================
# 🛒 CREATE ORDER
# ==========================================================
@router.post(
    "/markets/{market_id}/vendors/{vendor_id}/orders",
    response_model=OrderOut,
)
def create_order_endpoint(
    market_id: UUID,
    vendor_id: UUID,
    payload: CreateOrderPayload,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("orders.create")),
):
    return create_order(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        customer_id=str(payload.user_id),
        items=[{"product_id": str(i.product_id), "quantity": i.quantity} for i in payload.items],
    )

# ==========================================================
# 📦 LIST ORDERS (USER / VENDOR)
# ==========================================================
@router.get("/orders", response_model=CursorPaginatedOrders)
def list_orders_endpoint(
    scope: str = Query("user", enum=["user", "vendor"]),
    status: str | None = Query(None),
    sort: str = Query("newest", enum=["newest", "oldest", "highest"]),
    search: str | None = Query(None),
    cursor: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    jwt: str = Depends(get_current_jwt),
    current_user=Depends(require_permissions(["orders.read"])),
):
    user_id = current_user["sub"]

    try:
        if scope == "vendor":
            vendor_id = get_vendor_id_for_user(jwt, user_id)

            if not vendor_id:
                # User is not a vendor → return empty safely
                return {
                    "data": [],
                    "next_cursor": None,
                }

            result = get_orders_for_vendor_cursor(
                jwt=jwt,
                vendor_id=vendor_id,
                status=status,
                sort=sort,
                search=search,
                cursor=cursor,
                limit=limit,
            )
        else:
            result = get_orders_for_user_cursor(
                jwt=jwt,
                user_id=user_id,
                status=status,
                sort=sort,
                cursor=cursor,
                limit=limit,
            )

        return result

    except HTTPException:
        raise

    except Exception as e:
        print("❌ list_orders_endpoint error:", repr(e))
        raise HTTPException(status_code=500, detail="Failed to load orders")

# ==========================================================
# 🔍 GET MY ORDERS
# ==========================================================
@router.get("/orders/me")
def get_my_orders(
    jwt: str = Depends(get_current_jwt),
    current_user = Depends(require_permissions("orders.read")),
):
    return get_orders_for_user_cursor(jwt=jwt, user_id=current_user["sub"])

# ==========================================================
# 🔍 GET ORDER DETAILS
# ==========================================================
@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(
    order_id: UUID,
    jwt: str = Depends(get_current_jwt),
    current_user = Depends(require_permissions("orders.read")),
):
    return get_order_by_id(jwt=jwt, order_id=str(order_id), user_id=current_user["sub"])

# ==========================================================
# ✅ CONFIRM ORDER (VENDOR)
# ==========================================================
@router.post("/orders/{order_id}/confirm", response_model=OrderConfirmOut)
def confirm_order_endpoint(
    order_id: str,
    jwt: str = Depends(get_current_jwt),
    current_user = Depends(require_permissions("orders.confirm")),
):
    user_id = current_user["sub"]
    vendor_id = get_vendor_id_for_user(jwt, user_id)

    try:
        return confirm_order(jwt=jwt, order_id=order_id, vendor_id=vendor_id)

    except HTTPException:
        raise

    except Exception as e:
        msg = str(e)
        if "Invalid order status transition" in msg:
            raise HTTPException(status_code=409, detail="Order cannot be confirmed in its current state")
        raise HTTPException(status_code=500, detail="Failed to confirm order")

# ==========================================================
# ❌ CANCEL ORDER
# ==========================================================
@router.post("/orders/{order_id}/cancel", response_model=OrderOut)
def cancel_order_endpoint(
    order_id: str,
    jwt: str = Depends(get_current_jwt),
    current_user = Depends(require_permissions("orders.cancel")),
):
    user_id = current_user["sub"]
    vendor_id = get_vendor_id_for_user(jwt, user_id)

    try:
        return cancel_order(jwt=jwt, order_id=order_id, vendor_id=vendor_id)

    except HTTPException:
        raise

    except Exception as e:
        msg = str(e)
        if "Invalid order status transition" in msg:
            raise HTTPException(status_code=409, detail="Order cannot be canceled in its current state")
        raise HTTPException(status_code=500, detail="Failed to cancel order")

# ==========================================================
# 💰 REFUND ORDER
# ==========================================================
@router.post("/orders/{order_id}/refund", response_model=OrderOut)
def refund_order_route(
    order_id: UUID,
    payload: RefundPayload,
    jwt: str = Depends(get_current_jwt),
    current_user = Depends(require_permissions("orders.refund")),
):
    vendor_id = get_vendor_id_for_user(jwt, current_user["sub"])
    return refund_order(jwt=jwt, order_id=str(order_id), amount=payload.amount, reason=payload.reason)


@router.get("/orders/summary")
def orders_summary(
    scope: str = Query("user"),
    current_user: dict = Depends(get_current_user),
):
    try:
        jwt = current_user["jwt"]
        user_id = current_user["sub"]

        if scope == "vendor":
            vendor_id = get_vendor_id_for_user(jwt, user_id)

            if not vendor_id:
                return {
                    "total_orders": 0,
                    "pending": 0,
                    "confirmed": 0,
                    "canceled": 0,
                    "total_revenue": 0,
                }

            return get_orders_summary(
                jwt=jwt,
                vendor_id=vendor_id,
            )

        return get_orders_summary(
            jwt=jwt,
            user_id=user_id,
        )

    except Exception as e:
        print("❌ orders_summary error:", e)
        raise HTTPException(status_code=500, detail="Failed to load summary")
