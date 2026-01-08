from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List, Annotated
from datetime import datetime


# -------------------------
# Base / Core schemas
# -------------------------

class ProductBase(BaseModel):
    name: str
    price: float
    active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    active: Optional[bool] = None


class ProductOut(ProductBase):
    id: UUID
    vendor_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# Bulk CREATE schemas
# -------------------------

class ProductBulkCreateItem(BaseModel):
    name: str
    price: float
    active: bool = True


NonEmptyProductCreateList = Annotated[
    List[ProductBulkCreateItem],
    Field(min_length=1)
]


class ProductBulkCreate(BaseModel):
    products: NonEmptyProductCreateList


# -------------------------
# Bulk UPDATE schemas
# -------------------------

class ProductBulkUpdateItem(BaseModel):
    id: UUID
    name: Optional[str] = None
    price: Optional[float] = None
    active: Optional[bool] = None


NonEmptyProductUpdateList = Annotated[
    List[ProductBulkUpdateItem],
    Field(min_length=1)
]


class ProductBulkUpdate(BaseModel):
    products: NonEmptyProductUpdateList
