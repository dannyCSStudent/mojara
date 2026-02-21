# routes/orders.py
# has been audited for permissions and dependencies, and implements the following endpoints:
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List

from app.core.dependencies import get_current_jwt, require_permissions
from app.schemas.orders import (
    CreateOrderPayload,
    OrderOut,
    OrderConfirmOut,
    RefundPayload,
)
from app.repositories.orders import (
    create_order,
    confirm_order,
    cancel_order,
    get_order_by_id,
    get_orders_for_user,
    get_orders_for_vendor,
    get_vendor_id_for_user,
    refund_order,
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
@router.get("/orders")
def list_orders_endpoint(
    scope: str = Query("user", enum=["user", "vendor"]),
    jwt: str = Depends(get_current_jwt),
    current_user = Depends(require_permissions(["orders.read"])),
):
    user_id = current_user["sub"]

    try:
        if scope == "vendor":
            # Only vendors with orders.read permission can fetch vendor orders
            _ = require_permissions("orders.vendor_read")(current_user)
            vendor_id = get_vendor_id_for_user(jwt, user_id)
            return get_orders_for_vendor(jwt=jwt, vendor_id=vendor_id)

        return get_orders_for_user(jwt=jwt, user_id=user_id)

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
    return get_orders_for_user(jwt=jwt, user_id=current_user["sub"])

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
