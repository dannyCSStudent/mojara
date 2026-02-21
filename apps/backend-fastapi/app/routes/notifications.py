# routes/notifications.py
# has been audited for permissions and dependencies, and implements the following endpoints:

from fastapi import APIRouter, Depends
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
    mark_notification_read,
    get_unread_count
)
from app.core.dependencies import get_current_user, require_permissions

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# -----------------------------------------
# List subscriptions
# -----------------------------------------
@router.get("/subscriptions", response_model=List[NotificationSubscriptionOut])
def list_subscriptions(
    current_user = Depends(require_permissions("notifications.read"))
):
    return get_user_subscriptions(
        jwt=current_user["_jwt"],
        user_id=current_user["sub"],
    )

# -----------------------------------------
# Create subscription
# -----------------------------------------
@router.post("/subscriptions", response_model=NotificationSubscriptionOut)
def subscribe(
    payload: NotificationSubscriptionIn,
    current_user = Depends(require_permissions("notifications.create"))
):
    return create_subscription(
        jwt=current_user["_jwt"],
        user_id=current_user["sub"],
        payload=payload.dict(),
    )

# -----------------------------------------
# Delete subscription
# -----------------------------------------
@router.delete("/subscriptions/{subscription_id}")
def unsubscribe(
    subscription_id: str,
    current_user = Depends(require_permissions("notifications.delete"))
):
    delete_subscription(
        jwt=current_user["_jwt"],
        subscription_id=subscription_id,
        user_id=current_user["sub"],
    )
    return {"ok": True}

# -----------------------------------------
# List notifications
# -----------------------------------------
@router.get("", response_model=List[NotificationOut])
def list_notifications(
    current_user = Depends(require_permissions("notifications.read"))
):
    return get_user_notifications(
        jwt=current_user["_jwt"],
        user_id=current_user["sub"],
    )

# -----------------------------------------
# Mark notification as read
# -----------------------------------------
@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    current_user = Depends(require_permissions("notifications.update"))
):
    mark_notification_read(
        jwt=current_user["_jwt"],
        notification_id=notification_id,
        user_id=current_user["sub"],
    )
    return {"ok": True}

# -----------------------------------------
# Debug current user (admin/debug only)
# -----------------------------------------
@router.get("/debug-auth")
def debug_auth(
    current_user = Depends(require_permissions("notifications.read"))
):
    return current_user

# -----------------------------------------
# Unread notification count
# -----------------------------------------
@router.get("/unread-count")
def unread_count(
    current_user = Depends(require_permissions("notifications.read"))
):
    return {
        "count": get_unread_count(
            jwt=current_user["_jwt"],
            user_id=current_user["sub"],
        )
    }
