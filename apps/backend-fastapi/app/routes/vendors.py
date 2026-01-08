from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import List

from app.auth import get_current_user
from app.schemas.vendors import VendorCreate, VendorUpdate, VendorOut
from app.repositories.vendors import (
    get_vendors,
    get_vendor,
    create_vendor,
    update_vendor,
    delete_vendor,
)

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("", response_model=List[VendorOut])
def list_vendors(user=Depends(get_current_user)):
    jwt = user["_jwt"]
    return get_vendors(jwt)


@router.get("/{vendor_id}", response_model=VendorOut)
def read_vendor(
    vendor_id: UUID,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    vendor = get_vendor(vendor_id, jwt)

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    return vendor


@router.post("", response_model=VendorOut)
def create_vendor_route(
    payload: VendorCreate,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]
    return create_vendor(payload.model_dump(), jwt)


@router.patch("/{vendor_id}", response_model=VendorOut)
def patch_vendor(
    vendor_id: UUID,
    payload: VendorUpdate,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields to update",
        )

    vendor = update_vendor(
        jwt=jwt,
        vendor_id=vendor_id,
        updates=updates,
    )

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found or not allowed",
        )

    return vendor


@router.delete("/{vendor_id}", status_code=204)
def delete_vendor_route(
    vendor_id: UUID,
    user=Depends(get_current_user),
):
    jwt = user["_jwt"]

    deleted = delete_vendor(vendor_id, jwt)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found or not allowed",
        )
