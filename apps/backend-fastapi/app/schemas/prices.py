# app/schemas/prices.py
from pydantic import BaseModel, Field


class PriceSignalIn(BaseModel):
    market_id: str = Field(..., description="Market UUID")
    size_band_id: str = Field(..., description="Size band UUID")
    price_per_kg: float = Field(..., gt=0)


# class PriceAgreementOut(BaseModel):
#     market_id: str
#     market_name: str
#     size_band: str
#     reference_price: float
#     confidence_score: float
#     sample_count: int
#     valid_until: str
