from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.schemas.notifications import (
    NotificationSubscriptionIn,
    NotificationSubscriptionOut,
    NotificationOut
)
from app.repositories.notifications import (
    get_user_subscriptions,
    create_subscription,
    delete_subscription,
    get_user_notifications,
    mark_notification_read
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


@router.get(
    "",
    response_model=List[NotificationOut],
)
def list_notifications(
    user=Depends(get_current_user),
):
    return get_user_notifications(
        jwt=user["_jwt"],
        user_id=user["id"],
    )


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    user=Depends(get_current_user),
):
    mark_notification_read(
        jwt=user["_jwt"],
        notification_id=notification_id,
        user_id=user["id"],
    )
#   Need to remove the underline in auth for jwt
    return {"ok": True}


@router.get("/debug-auth")
def debug_auth(user=Depends(get_current_user)):
    return user
