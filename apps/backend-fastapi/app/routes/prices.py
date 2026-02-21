# routes/prices.py
# has been audited for permissions and dependencies, and implements the following functions:

from fastapi import APIRouter, Depends, Query
from typing import List

from app.schemas.prices import PriceSignalIn, ActivePriceAgreementOut
from app.repositories.prices import (
    get_active_price_agreements,
    get_admin_price_agreements,
    lock_price_agreement,
    submit_price_signal,
    get_price_explain,
)
from app.core.dependencies import get_current_user, get_current_jwt, require_permissions

router = APIRouter(prefix="/prices", tags=["Prices"])

# -----------------------------------------
# Get active locked price agreements
# -----------------------------------------
@router.get("/active", response_model=List[ActivePriceAgreementOut])
def read_active_prices(jwt: str = Depends(get_current_jwt)):
    return get_active_price_agreements(jwt)

# -----------------------------------------
# Admin: list all price agreements
# -----------------------------------------
@router.get("/admin", response_model=List[ActivePriceAgreementOut])
def list_admin_prices(
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("prices.read")),
):
    return get_admin_price_agreements(jwt)

# -----------------------------------------
# Admin: lock price agreement
# -----------------------------------------
@router.post("/{price_id}/lock")
def lock_price(price_id: str, jwt: str = Depends(get_current_jwt), _=Depends(require_permissions("prices.lock"))):
    return lock_price_agreement(price_id, jwt)

# -----------------------------------------
# Vendor: submit price signal
# -----------------------------------------
@router.post("/signal")
def submit_signal(
    payload: PriceSignalIn,
    jwt: str = Depends(get_current_jwt),
    current_user = Depends(require_permissions("prices.signal")),
):
    return submit_price_signal(
        jwt=jwt,
        user_id=current_user["sub"],
        market_id=payload.market_id,
        size_band_id=payload.size_band_id,
        price_per_kg=payload.price_per_kg,
    )

# -----------------------------------------
# Explain prices
# -----------------------------------------
@router.get("/explain")
def explain_prices(
    market_id: str = Query(...),
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("prices.read")),
):
    return get_price_explain(jwt, market_id)
