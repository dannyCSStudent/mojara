from fastapi import APIRouter, Depends, Query
from uuid import UUID

from app.core.dependencies import require_permissions, get_current_jwt
from app.repositories.prices import (
    get_admin_price_agreements,
    get_price_explain,
    lock_price_agreement,
)
from app.schemas.prices import PriceExplainOut, PriceLockOut, ActivePriceAgreementOut


router = APIRouter(prefix="/prices")


@router.get("")
def list_admin_prices(
    status: str | None = Query(None),
    market_id: str | None = Query(None),
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("prices.read")),
):
    return get_admin_price_agreements(jwt, status=status, market_id=market_id)


@router.get("/explain", response_model=list[PriceExplainOut])
def explain_admin_prices(
    market_id: str = Query(...),
    jwt: str = Depends(get_current_jwt),
    _=Depends(require_permissions("prices.read")),
):
    return get_price_explain(jwt, market_id)


@router.post("/{price_id}/lock", response_model=PriceLockOut)
def lock_price(
    price_id: UUID,
    jwt: str = Depends(get_current_jwt),
    _admin = Depends(require_permissions("prices.lock")),
):
    return lock_price_agreement(price_id, jwt)
