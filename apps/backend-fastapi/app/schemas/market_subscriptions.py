from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MarketSubscriptionCreate(BaseModel):
    market_id: UUID


class MarketSubscriptionOut(BaseModel):
    market_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
