from fastapi import APIRouter, Depends
from typing import List

from app.schemas.notifications import (
    NotificationSubscriptionIn,
    NotificationSubscriptionOut,
)
from app.repositories.notifications import (
    get_user_subscriptions,
    create_subscription,
    delete_subscription,
)
from app.auth import get_current_user


router = APIRouter(prefix="/notifications", tags=["Notifications"])


# -------------------------
# List subscriptions
# -------------------------

@router.get(
    "/subscriptions",
    response_model=List[NotificationSubscriptionOut],
)
def list_subscriptions(
    user=Depends(get_current_user),
):
    return get_user_subscriptions(
        jwt=user["jwt"],
        user_id=user["id"],
    )


# -------------------------
# Create subscription
# -------------------------

@router.post(
    "/subscriptions",
    response_model=NotificationSubscriptionOut,
)
def subscribe(
    payload: NotificationSubscriptionIn,
    user=Depends(get_current_user),
):
    return create_subscription(
        jwt=user["jwt"],
        user_id=user["id"],
        payload=payload.dict(),
    )


# -------------------------
# Delete subscription
# -------------------------

@router.delete(
    "/subscriptions/{subscription_id}",
)
def unsubscribe(
    subscription_id: str,
    user=Depends(get_current_user),
):
    delete_subscription(
        jwt=user["jwt"],
        subscription_id=subscription_id,
        user_id=user["id"],
    )
    return {"ok": True}
