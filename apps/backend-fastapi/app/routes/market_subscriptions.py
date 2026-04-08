from fastapi import APIRouter, Depends

from app.core.dependencies import require_permissions
from app.repositories.market_subscriptions import (
    create_market_subscription,
    delete_market_subscription,
    list_market_subscriptions,
)
from app.schemas.market_subscriptions import (
    MarketSubscriptionCreate,
    MarketSubscriptionOut,
)


router = APIRouter(prefix="/me/market-subscriptions", tags=["market-subscriptions"])


@router.get("", response_model=list[MarketSubscriptionOut])
def get_my_market_subscriptions(
    current_user: dict = Depends(require_permissions("markets.read")),
):
    return list_market_subscriptions(
        jwt=current_user["_jwt"],
        user_id=current_user["sub"],
    )


@router.post("", response_model=MarketSubscriptionOut)
def create_my_market_subscription(
    payload: MarketSubscriptionCreate,
    current_user: dict = Depends(require_permissions("markets.read")),
):
    return create_market_subscription(
        jwt=current_user["_jwt"],
        user_id=current_user["sub"],
        market_id=str(payload.market_id),
    )


@router.delete("/{market_id}")
def delete_my_market_subscription(
    market_id: str,
    current_user: dict = Depends(require_permissions("markets.read")),
):
    delete_market_subscription(
        jwt=current_user["_jwt"],
        user_id=current_user["sub"],
        market_id=market_id,
    )
    return {"ok": True}
