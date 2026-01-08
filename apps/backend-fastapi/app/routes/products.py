from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID

from app.auth import get_current_user
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

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductOut])
def get_products(user=Depends(get_current_user)):
    jwt = user["_jwt"]
    return list_products(jwt)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: UUID,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    product = get_product_by_id(jwt, str(product_id))

    if not product:
        raise HTTPException(404, "Product not found")

    return product


@router.post("", response_model=ProductOut)
def create_product_route(
    payload: ProductCreate,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    return create_product(jwt, payload.model_dump())


@router.patch("/{product_id}", response_model=ProductOut)
def patch_product(
    product_id: UUID,
    payload: ProductUpdate,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(400, "No fields to update")

    product = update_product(jwt, str(product_id), updates)

    if not product:
        raise HTTPException(404, "Product not found or not allowed")

    return product


@router.delete("/{product_id}", status_code=204)
def delete_product_route(
    product_id: UUID,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    deleted = delete_product(jwt, str(product_id))

    if not deleted:
        raise HTTPException(404, "Product not found or not allowed")
