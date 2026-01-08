from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class VendorBase(BaseModel):
    name: str


class VendorCreate(VendorBase):
    market_id: UUID


class VendorUpdate(BaseModel):
    name: Optional[str] = None


class VendorOut(VendorBase):
    id: UUID
    market_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
