from pydantic import BaseModel
from datetime import date

class AdminOverview(BaseModel):
    total_orders_7d: int
    orders_today: int
    active_vendors: int
    active_price_agreements: int
    pending_orders: int


class OrdersTrendPoint(BaseModel):
    date: date
    count: int
