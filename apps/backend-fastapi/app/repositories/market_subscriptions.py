from fastapi import HTTPException
import httpx
from postgrest import APIError

from app.db import get_user_client


def list_market_subscriptions(jwt: str, user_id: str):
    supabase = get_user_client(jwt)

    try:
        result = (
            supabase
            .table("market_subscriptions")
            .select("market_id, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=False)
            .execute()
        )
    except httpx.ConnectError:
        raise HTTPException(503, "Database unavailable")
    except APIError as exc:
        raise HTTPException(500, str(exc))

    return result.data or []


def create_market_subscription(jwt: str, user_id: str, market_id: str):
    supabase = get_user_client(jwt)

    try:
        result = (
            supabase
            .table("market_subscriptions")
            .insert({
                "user_id": user_id,
                "market_id": market_id,
            })
            .execute()
        )
    except httpx.ConnectError:
        raise HTTPException(503, "Database unavailable")
    except APIError as exc:
        message = str(exc)
        if "duplicate" in message.lower():
            existing = (
                supabase
                .table("market_subscriptions")
                .select("market_id, created_at")
                .eq("user_id", user_id)
                .eq("market_id", market_id)
                .single()
                .execute()
            )
            return existing.data
        raise HTTPException(500, message)

    if not result.data:
        raise HTTPException(400, "Failed to create market subscription")

    return result.data[0]


def delete_market_subscription(jwt: str, user_id: str, market_id: str):
    supabase = get_user_client(jwt)

    existing = (
        supabase
        .table("market_subscriptions")
        .select("market_id")
        .eq("user_id", user_id)
        .eq("market_id", market_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(404, "Market subscription not found")

    (
        supabase
        .table("market_subscriptions")
        .delete()
        .eq("user_id", user_id)
        .eq("market_id", market_id)
        .execute()
    )

    return True
