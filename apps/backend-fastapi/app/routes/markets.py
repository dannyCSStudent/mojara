# routes/markets.py
# has been audited for permissions and dependencies, and implements the following endpoints:
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import List

from app.core.dependencies import get_current_jwt, require_permissions
from app.repositories.markets import list_markets, get_market_by_id
from app.repositories.vendors import list_vendors_for_market, create_vendor
from app.repositories.products import (
    get_products_for_vendor,
    create_product_for_vendor,
    update_product_for_vendor,
    delete_product_for_vendor,
    create_products_for_vendor_bulk,
    bulk_update_products_for_vendor,
    update_product_inventory
)
from app.schemas.markets import MarketOut
from app.schemas.vendors import VendorOut, VendorCreate
from app.schemas.products import (
    ProductOut,
    ProductCreate,
    ProductUpdate,
    ProductBulkCreate,
    ProductBulkUpdate,
    ProductInventoryUpdate
)

router = APIRouter(tags=["markets"])

# -----------------------
# MARKETS
# -----------------------
@router.get("/markets", response_model=list[MarketOut])
def get_markets(
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("markets.read")),
):
    return list_markets(jwt)


@router.get("/markets/{market_id}", response_model=MarketOut)
def get_market(
    market_id: UUID,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("markets.read")),
):
    market = get_market_by_id(jwt, market_id)
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    return market


# -----------------------
# VENDORS
# -----------------------
@router.get("/markets/{market_id}/vendors", response_model=list[VendorOut])
def get_vendors_for_market(
    market_id: UUID,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("vendors.read")),
):
    return list_vendors_for_market(jwt, market_id)


@router.post("/markets/{market_id}/vendors", response_model=VendorOut, status_code=201)
def create_vendor_for_market(
    market_id: UUID,
    payload: VendorCreate,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("vendors.create")),
):
    vendor = create_vendor(jwt, market_id=market_id, name=payload.name)
    if not vendor:
        raise HTTPException(status_code=403, detail="Not allowed to create vendor in this market")
    return vendor


# -----------------------
# PRODUCTS
# -----------------------
@router.get(
    "/markets/{market_id}/vendors/{vendor_id}/products",
    response_model=List[ProductOut],
)
def get_vendor_products(
    market_id: UUID,
    vendor_id: UUID,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("products.read")),
):
    return get_products_for_vendor(jwt, market_id=str(market_id), vendor_id=str(vendor_id))


@router.post(
    "/markets/{market_id}/vendors/{vendor_id}/products",
    response_model=ProductOut,
)
def create_market_vendor_product(
    market_id: UUID,
    vendor_id: UUID,
    payload: ProductCreate,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("products.create")),
):
    product = create_product_for_vendor(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        payload=payload.model_dump(exclude={"vendor_id"}),
    )
    if not product:
        raise HTTPException(status_code=403, detail="Not allowed to create product for this vendor")
    return product


@router.patch(
    "/markets/{market_id}/vendors/{vendor_id}/products/{product_id}",
    response_model=ProductOut,
)
def patch_market_vendor_product(
    market_id: UUID,
    vendor_id: UUID,
    product_id: UUID,
    payload: ProductUpdate,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("products.update")),
):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    product = update_product_for_vendor(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        product_id=str(product_id),
        updates=updates,
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not allowed")
    return product


@router.patch(
    "/markets/{market_id}/vendors/{vendor_id}/products/bulk",
    response_model=list[ProductOut],
)
def bulk_update_products(
    market_id: UUID,
    vendor_id: UUID,
    payload: ProductBulkUpdate,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("products.bulk_update")),
):
    products = [p.model_dump(exclude_unset=True) for p in payload.products]
    return bulk_update_products_for_vendor(jwt, vendor_id=str(vendor_id), products=products)


@router.delete(
    "/markets/{market_id}/vendors/{vendor_id}/products/{product_id}",
)
def delete_market_vendor_product(
    market_id: UUID,
    vendor_id: UUID,
    product_id: UUID,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("products.delete")),
):
    deleted = delete_product_for_vendor(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        product_id=str(product_id),
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found or not allowed")
    return {"status": "deleted"}


@router.post(
    "/markets/{market_id}/vendors/{vendor_id}/products/bulk",
    response_model=list[ProductOut],
)
def bulk_create_products(
    market_id: UUID,
    vendor_id: UUID,
    payload: ProductBulkCreate,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("products.bulk_create")),
):
    products = create_products_for_vendor_bulk(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        products=[p.model_dump() for p in payload.products],
    )
    return products


@router.patch(
    "/markets/{market_id}/vendors/{vendor_id}/products/{product_id}/inventory",
    response_model=ProductOut,
)
def update_inventory(
    market_id: UUID,
    vendor_id: UUID,
    product_id: UUID,
    payload: ProductInventoryUpdate,
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("products.inventory_update")),
):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No inventory changes")
    product = update_product_inventory(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        product_id=str(product_id),
        updates=updates,
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
