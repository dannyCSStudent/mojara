from app.db import get_user_client
from fastapi import HTTPException
import httpx
from postgrest import APIError
from datetime import datetime


# =========================
# Queries
# =========================

def get_user_subscriptions(jwt: str, user_id: str):
    supabase = get_user_client(jwt)

    try:
        res = (
            supabase
            .table("notification_subscriptions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
    except httpx.ConnectError:
        raise HTTPException(503, "Database unavailable")
    except APIError as e:
        raise HTTPException(500, str(e))

    return res.data or []


# =========================
# Mutations
# =========================

def create_subscription(jwt: str, user_id: str, payload: dict):
    supabase = get_user_client(jwt)

    data = {
        **payload,
        "user_id": user_id,
    }

    res = (
        supabase
        .table("notification_subscriptions")
        .insert(data)
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(400, "Failed to create subscription")

    return res.data


def delete_subscription(jwt: str, subscription_id: str, user_id: str):
    supabase = get_user_client(jwt)

    # ensure ownership
    existing = (
        supabase
        .table("notification_subscriptions")
        .select("id")
        .eq("id", subscription_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(404, "Subscription not found")

    supabase \
        .table("notification_subscriptions") \
        .delete() \
        .eq("id", subscription_id) \
        .execute()

    return True


def get_user_notifications(jwt: str, user_id: str):
    supabase = get_user_client(jwt)

    try:
        res = (
            supabase
            .table("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
    except httpx.ConnectError:
        raise HTTPException(503, "Database unavailable")
    except APIError as e:
        raise HTTPException(500, str(e))

    return res.data or []


def mark_notification_read(jwt: str, notification_id: str, user_id: str):
    supabase = get_user_client(jwt)

    # ensure ownership
    existing = (
        supabase
        .table("notifications")
        .select("id")
        .eq("id", notification_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(404, "Notification not found")

    supabase \
        .table("notifications") \
        .update({"read_at": datetime.utcnow().isoformat()}) \
        .eq("id", notification_id) \
        .execute()

    return True


def get_unread_count(jwt: str, user_id: str):
    supabase = get_user_client(jwt)

    res = (
        supabase
        .table("notifications")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .is_("read_at", None)
        .execute()
    )

    return res.count or 0
