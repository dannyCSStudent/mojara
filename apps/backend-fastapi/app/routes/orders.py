from app.schemas.orders import (
    CreateOrderPayload,
    OrderOut,
    OrderConfirmOut
)
from uuid import UUID

from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.repositories.orders import create_order, confirm_order, cancel_order, get_order_by_id

router = APIRouter(tags=["orders"])

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

    order = create_order(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        customer_id=str(payload.customer_id),
        items=[
            {
                "product_id": str(i.product_id),
                "quantity": i.quantity,
            }
            for i in payload.items
        ],
    )

    return get_order_by_id(jwt, order["id"])


@router.post(
    "/orders/{order_id}/confirm",
    response_model=OrderConfirmOut,
)
def confirm_order_endpoint(
    order_id: str,
    user=Depends(get_current_user),
):
    return confirm_order(
        jwt=user["_jwt"],
        order_id=order_id,
    )



@router.post(
    "/orders/{order_id}/cancel",
    response_model=OrderOut,
)
def cancel_order_endpoint(
    order_id: str,
    user=Depends(get_current_user),
):
    return cancel_order(
        jwt=user["_jwt"],
        order_id=order_id,
    )
