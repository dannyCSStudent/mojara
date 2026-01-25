from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException
from app.auth import get_current_user
from app.schemas.orders import (
    CreateOrderPayload,
    OrderOut,
    OrderConfirmOut,
)
from app.repositories.orders import (
    create_order,
    confirm_order,
    cancel_order,
    get_order_by_id,
    get_orders_for_user,
    get_orders_for_vendor,
    get_vendor_id_for_user,
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
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

    return create_order(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        customer_id=str(payload.user_id),
        items=[
            {
                "product_id": str(i.product_id),
                "quantity": i.quantity,
            }
            for i in payload.items
        ],
    )


# ==========================================================
# 📦 LIST ORDERS (USER / VENDOR)
# ==========================================================

@router.get("/orders")
def list_orders_endpoint(
    scope: str = Query("user", enum=["user", "vendor"]),
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    user_id = user.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid auth token")

    try:
        if scope == "vendor":
            vendor_id = get_vendor_id_for_user(jwt, user_id)
            return get_orders_for_vendor(jwt=jwt, vendor_id=vendor_id)

        return get_orders_for_user(jwt=jwt, user_id=user_id)

    except HTTPException:
        raise

    except Exception as e:
        print("❌ list_orders_endpoint error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to load orders",
        )


# ==========================================================
# 🔍 ORDER DETAILS
# ==========================================================

@router.get("/orders/me")
def get_my_orders(user=Depends(get_current_user)):
    return get_orders_for_user(
        user_id=user["sub"],
        jwt=user["_jwt"],
    )



@router.get(
    "/orders/{order_id}",
    response_model=OrderOut,
)
def get_order_endpoint(
    order_id: UUID,
    user=Depends(get_current_user),
):
    return get_order_by_id(
        jwt=user["_jwt"],
        order_id=order_id,
    )



# ==========================================================
# ✅ CONFIRM ORDER (VENDOR)
# ==========================================================

@router.post("/orders/{order_id}/confirm", response_model=OrderConfirmOut)
def confirm_order_endpoint(
    order_id: str,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    user_id = user.get("sub")

    vendor_id = get_vendor_id_for_user(jwt, user_id)

    try:
        return confirm_order(
            jwt=jwt,
            order_id=order_id,
            vendor_id=vendor_id,
        )

    except HTTPException:
        raise

    except Exception as e:
        msg = str(e)

        if "Invalid order status transition" in msg:
            raise HTTPException(
                status_code=409,
                detail="Order cannot be confirmed in its current state",
            )

        raise HTTPException(
            status_code=500,
            detail="Failed to confirm order",
        )



# ==========================================================
# ❌ CANCEL ORDER
# ==========================================================

@router.post(
    "/orders/{order_id}/cancel",
    response_model=OrderOut,
)
def cancel_order_endpoint(
    order_id: str,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    user_id = user.get("sub")

    vendor_id = get_vendor_id_for_user(jwt, user_id)

    try:
        return cancel_order(
            jwt=jwt,
            order_id=order_id,
            vendor_id=vendor_id,
        )

    except HTTPException:
        raise

    except Exception as e:
        msg = str(e)

        if "Invalid order status transition" in msg:
            raise HTTPException(
                status_code=409,
                detail="Order cannot be canceled in its current state",
            )

        raise HTTPException(
            status_code=500,
            detail="Failed to cancel order",
        )
