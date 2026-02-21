# routes/vendors.py
# has been audited for permissions and dependencies, and implements the following endpoints:


from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import List

from app.core.dependencies import get_current_user, require_permissions
from app.schemas.vendors import VendorCreate, VendorUpdate, VendorOut
from app.repositories.vendors import (
    get_vendors,
    get_vendor,
    create_vendor,
    update_vendor,
    delete_vendor,
)
from app.repositories.orders import get_vendor_id_for_user

router = APIRouter(prefix="/vendors", tags=["Vendors"])

# -----------------------------
# List vendors
# -----------------------------
@router.get("", response_model=List[VendorOut])
def list_vendors(
    current_user=Depends(require_permissions("vendors.read"))
):
    return get_vendors(current_user["_jwt"])


# -----------------------------
# Get single vendor
# -----------------------------
@router.get("/{vendor_id}", response_model=VendorOut)
def read_vendor(
    vendor_id: UUID,
    current_user=Depends(require_permissions("vendors.read"))
):
    vendor = get_vendor(vendor_id, current_user["_jwt"])

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    return vendor


# -----------------------------
# Create vendor
# -----------------------------
@router.post("", response_model=VendorOut)
def create_vendor_route(
    payload: VendorCreate,
    current_user=Depends(require_permissions("vendors.create"))
):
    return create_vendor(payload.model_dump(), current_user["_jwt"])


# -----------------------------
# Update vendor
# -----------------------------
@router.patch("/{vendor_id}", response_model=VendorOut)
def patch_vendor(
    vendor_id: UUID,
    payload: VendorUpdate,
    current_user=Depends(require_permissions("vendors.update"))
):
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    vendor = update_vendor(current_user["_jwt"], vendor_id, updates)

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found or not allowed")

    return vendor


# -----------------------------
# Delete vendor
# -----------------------------
@router.delete("/{vendor_id}", status_code=204)
def delete_vendor_route(
    vendor_id: UUID,
    current_user=Depends(require_permissions("vendors.delete"))
):
    deleted = delete_vendor(vendor_id, current_user["_jwt"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Vendor not found or not allowed")


# -----------------------------
# Get my vendor
# -----------------------------
@router.get("/me")
def get_my_vendor(current_user=Depends(get_current_user)):
    jwt = current_user["_jwt"]
    user_id = current_user.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid auth token")

    vendor_id = get_vendor_id_for_user(jwt, user_id)

    if not vendor_id:
        raise HTTPException(status_code=404, detail="Vendor not found")

    return {"vendor_id": vendor_id}
