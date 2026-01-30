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
    user_id: UUID
    items: List[CreateOrderItem]


# -------------------------
# Order Item (output)
# -------------------------

class OrderItemOut(BaseModel):
    product_id: UUID
    quantity: int
    unit_price: float
    line_total: float
    name: str

    class Config:
        from_attributes = True


# -------------------------
# Order Output
# -------------------------

class RefundOut(BaseModel):
    id: UUID
    amount: float
    reason: str | None
    created_at: datetime

    class Config:
        from_attributes = True
        
class OrderOut(BaseModel):
    id: UUID
    market_id: UUID
    vendor_id: UUID
    user_id: UUID
    status: str
    created_at: datetime

    total: float
    refunded_total: float

    items: List[OrderItemOut]
    refunds: List[RefundOut]

    class Config:
        from_attributes = True



class OrderConfirmOut(BaseModel):
    id: UUID
    market_id: UUID
    vendor_id: UUID
    user_id: UUID
    status: str
    created_at: datetime



