# routes/admin_prices.py
# has been audited for permissions and dependencies, and implements the following endpoints:
from fastapi import APIRouter, Depends
from uuid import UUID

from app.core.dependencies import require_permissions, get_current_jwt
from app.repositories.prices import lock_price_agreement, get_admin_price_agreements
from app.schemas.prices import PriceLockOut


router = APIRouter()
print("Admin Prices router initialized")

@router.get("/prices")
def list_admin_prices(
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("admin")),
):
    return get_admin_price_agreements(jwt)



@router.post(
    "/{price_id}/lock",
    response_model=PriceLockOut,
)
def lock_price(
    price_id: UUID,
    jwt: str = Depends(get_current_jwt),
    _admin = Depends(require_permissions("admin")),
):
    print(f"Locking price agreement with id: {price_id}")
    return lock_price_agreement(price_id, jwt)
