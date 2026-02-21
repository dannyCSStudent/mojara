# routes/products.py
# has been audited for permissions and dependencies, and implements the following endpoints:

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID

from app.core.dependencies import get_current_user, require_permissions
from app.schemas.products import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
)
from app.repositories.products import (
    list_products,
    get_product_by_id,
    create_product,
    update_product,
    delete_product,
)

router = APIRouter(prefix="/products", tags=["Products"])

# -----------------------------------------
# List products
# -----------------------------------------
@router.get("", response_model=List[ProductOut])
def get_products(
    current_user = Depends(require_permissions("products.read"))
):
    return list_products(current_user["_jwt"])


# -----------------------------------------
# Get single product
# -----------------------------------------
@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: UUID,
    current_user = Depends(require_permissions("products.read"))
):
    product = get_product_by_id(current_user["_jwt"], str(product_id))

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


# -----------------------------------------
# Create product
# -----------------------------------------
@router.post("", response_model=ProductOut)
def create_product_route(
    payload: ProductCreate,
    current_user = Depends(require_permissions("products.create"))
):
    return create_product(current_user["_jwt"], payload.model_dump())


# -----------------------------------------
# Update product
# -----------------------------------------
@router.patch("/{product_id}", response_model=ProductOut)
def patch_product(
    product_id: UUID,
    payload: ProductUpdate,
    current_user = Depends(require_permissions("products.update"))
):
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    product = update_product(current_user["_jwt"], str(product_id), updates)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not allowed")

    return product


# -----------------------------------------
# Delete product
# -----------------------------------------
@router.delete("/{product_id}", status_code=204)
def delete_product_route(
    product_id: UUID,
    current_user = Depends(require_permissions("products.delete"))
):
    deleted = delete_product(current_user["_jwt"], str(product_id))

    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found or not allowed")
