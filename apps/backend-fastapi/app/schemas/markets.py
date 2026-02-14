from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class MarketBase(BaseModel):
    name: str
    location: str
    description: Optional[str] = None


class MarketCreate(MarketBase):
    pass


class MarketUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None


class MarketOut(MarketBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
