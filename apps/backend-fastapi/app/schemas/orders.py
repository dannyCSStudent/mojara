from pydantic import BaseModel, Field
from uuid import UUID
from typing import List
from datetime import datetime


# -------------------------
# Order Item (input)
# -------------------------

class CreateOrderItem(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)


# -------------------------
# Order Create Payload
# -------------------------

class CreateOrderPayload(BaseModel):
    customer_id: UUID
    items: List[CreateOrderItem]


# -------------------------
# Order Item (output)
# -------------------------

class OrderItemOut(BaseModel):
    product_id: UUID
    quantity: int

    class Config:
        from_attributes = True


# -------------------------
# Order Output
# -------------------------

class OrderOut(BaseModel):
    id: UUID
    market_id: UUID
    vendor_id: UUID
    customer_id: UUID
    status: str
    created_at: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True


class OrderConfirmOut(BaseModel):
    id: UUID
    market_id: UUID
    vendor_id: UUID
    user_id: UUID
    status: str
    created_at: datetime

