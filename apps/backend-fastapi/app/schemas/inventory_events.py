from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class InventoryEventOut(BaseModel):
    id: UUID
    product_id: UUID
    vendor_id: UUID
    market_id: UUID
    event_type: str
    cause: str
    reference_order_id: UUID | None = None
    stock_quantity_before: int | None = None
    stock_quantity_after: int | None = None
    change_amount: int | None = None
    is_available_before: bool | None = None
    is_available_after: bool | None = None
    created_at: datetime

    class Config:
        from_attributes = True
