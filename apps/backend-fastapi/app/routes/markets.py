from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import List
from app.auth import get_current_user
from app.repositories.markets import (
    list_markets,
    get_market_by_id,
)
from app.repositories.vendors import (
    list_vendors_for_market, 
    create_vendor )
from app.repositories.products import (
    get_products_for_vendor, 
    create_product_for_vendor, 
    update_product_for_vendor, 
    delete_product_for_vendor, 
    create_products_for_vendor_bulk,
    bulk_update_products_for_vendor,
    update_product_inventory)
from app.repositories.orders import get_order_by_id, create_order
from app.schemas.markets import MarketOut
from app.schemas.vendors import VendorOut, VendorCreate
from app.schemas.products import (
    ProductOut, 
    ProductCreate, 
    ProductUpdate, 
    ProductBulkCreate,
    ProductBulkUpdate,
    ProductInventoryUpdate)
from app.schemas.orders import CreateOrderPayload, OrderOut



router = APIRouter(tags=["markets"])

@router.get("/markets", response_model=list[MarketOut])
def get_markets(user=Depends(get_current_user)):
    """
    Returns markets visible to the current user.
    Access enforced by Supabase RLS.
    """
    jwt = user["_jwt"]
    return list_markets(jwt)


@router.get("/markets/{market_id}", response_model=MarketOut)
def get_market(
    market_id: UUID,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

    market = get_market_by_id(jwt, market_id)

    if not market:
        raise HTTPException(
            status_code=404,
            detail="Market not found",
        )

    return market


@router.get(
    "/markets/{market_id}/vendors",
    response_model=list[VendorOut],
)
def get_vendors_for_market(
    market_id: UUID,
    user=Depends(get_current_user),
):
    """
    Returns vendors for a given market.
    Access enforced entirely by Supabase RLS.
    """
    jwt = user["_jwt"]

    return list_vendors_for_market(jwt, market_id)

@router.post(
    "/markets/{market_id}/vendors",
    response_model=VendorOut,
    status_code=201,
)
def create_vendor_for_market(
    market_id: UUID,
    payload: VendorCreate,
    user=Depends(get_current_user),
):
    """
    Create a vendor inside a market.
    Market access enforced by Supabase RLS.
    """
    jwt = user["_jwt"]

    vendor = create_vendor(
        jwt,
        market_id=market_id,   # 🔐 enforced by URL
        name=payload.name,
    )

    if not vendor:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to create vendor in this market",
        )

    return vendor


@router.get(
    "/markets/{market_id}/vendors/{vendor_id}/products",
    response_model=List[ProductOut],
)
def get_vendor_products(
    market_id: UUID,
    vendor_id: UUID,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    print("JWT:", jwt)
    return get_products_for_vendor(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
    )

@router.post(
    "/markets/{market_id}/vendors/{vendor_id}/products",
    response_model=ProductOut,
)
def create_market_vendor_product(
    market_id: UUID,
    vendor_id: UUID,
    payload: ProductCreate,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

    product = create_product_for_vendor(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        payload=payload.model_dump(exclude={"vendor_id"}),
    )

    if not product:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to create product for this vendor",
        )

    return product


@router.patch(
    "/markets/{market_id}/vendors/{vendor_id}/products/bulk",
    response_model=list[ProductOut],
)
def bulk_update_products(
    market_id: UUID,
    vendor_id: UUID,
    payload: ProductBulkUpdate,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

    products = [
        p.model_dump(exclude_unset=True)
        for p in payload.products
    ]

    return bulk_update_products_for_vendor(
        jwt=jwt,
        vendor_id=str(vendor_id),
        products=products,
    )


@router.patch(
    "/markets/{market_id}/vendors/{vendor_id}/products/{product_id}",
    response_model=ProductOut,
)
def patch_market_vendor_product(
    market_id: UUID,
    vendor_id: UUID,
    product_id: UUID,
    payload: ProductUpdate,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(400, "No fields to update")

    product = update_product_for_vendor(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        product_id=str(product_id),
        updates=updates,
    )

    if not product:
        raise HTTPException(404, "Product not found or not allowed")

    return product


@router.delete(
    "/markets/{market_id}/vendors/{vendor_id}/products/{product_id}",
)
def delete_market_vendor_product(
    market_id: UUID,
    vendor_id: UUID,
    product_id: UUID,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

    deleted = delete_product_for_vendor(
        jwt=jwt,
        market_id=str(market_id),
        vendor_id=str(vendor_id),
        product_id=str(product_id),
    )

    if not deleted:
        raise HTTPException(404, "Product not found or not allowed")

    return {"status": "deleted"}


@router.post(
    "/markets/{market_id}/vendors/{vendor_id}/products/bulk",
    response_model=list[ProductOut],
)
def bulk_create_products(
    market_id: UUID,
    vendor_id: UUID,
    payload: ProductBulkCreate,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

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
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    print("user:", user)
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

