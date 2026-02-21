from app.db import get_user_client
from fastapi import HTTPException
from postgrest import APIError
import httpx
from uuid import UUID


def get_active_price_agreements(jwt: str):
    supabase = get_user_client(jwt)

    try:
        res = (
            supabase
            .from_("active_price_agreements")
            .select(
                """
                market_id,
                size_band_id,
                reference_price,
                confidence_score,
                sample_count,
                valid_from,
                valid_until
                """
            )
            .order("market_id")
            .order("size_band_id")
            .execute()
        )
    except httpx.ConnectError:
        raise HTTPException(503, "Database unavailable")
    except APIError as e:
        raise HTTPException(500, str(e))

    return res.data or []


def lock_price_agreement(price_id: UUID, jwt: str):
    supabase = get_user_client(jwt)

    try:
        # Fetch current status
        res = (
            supabase
            .from_("price_agreements")
            .select("id, status")
            .eq("id", str(price_id))
            .single()
            .execute()
        )
    except APIError as e:
        raise HTTPException(500, str(e))

    if not res.data:
        raise HTTPException(404, "Price agreement not found")

    if res.data["status"] != "draft":
        raise HTTPException(
            400,
            f"Cannot lock price with status '{res.data['status']}'"
        )

    try:
        supabase.from_("price_agreements").update(
            {
                "status": "locked",
            }
        ).eq("id", str(price_id)).execute()
    except APIError as e:
        raise HTTPException(500, str(e))

    return {
        "id": str(price_id),
        "status": "locked",
    }


def get_admin_price_agreements(jwt: str):
    supabase = get_user_client(jwt)

    try:
        res = (
            supabase
            .from_("price_agreements")
            .select(
                """
                id,
                market_id,
                size_band_id,
                reference_price,
                confidence_score,
                sample_count,
                status,
                valid_from,
                valid_until,
                created_at
                """
            )

            .order("created_at", desc=True)
            .execute()
        )
    except httpx.ConnectError:
        raise HTTPException(503, "Database unavailable")
    except APIError as e:
        raise HTTPException(500, str(e))

    return res.data or []
