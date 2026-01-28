# app/schemas/prices.py
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class PriceSignalIn(BaseModel):
    market_id: str = Field(..., description="Market UUID")
    size_band_id: str = Field(..., description="Size band UUID")
    price_per_kg: float = Field(..., gt=0)


class ActivePriceAgreementOut(BaseModel):
    market_id: UUID
    size_band_id: UUID
    reference_price: float
    confidence_score: float
    sample_count: int
    valid_from: datetime
    valid_until: datetime


class PriceLockOut(BaseModel):
    id: UUID
    status: str
