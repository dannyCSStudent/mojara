# repositories/prices.py
from app.db import get_user_client
from fastapi import HTTPException
from postgrest import APIError
from uuid import UUID

# -----------------------------------------
# Active Price Agreements
# -----------------------------------------
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
    except (APIError, ConnectionError) as e:
        raise HTTPException(500, f"Database error: {e}")

    return res.data or []

# -----------------------------------------
# Admin Price Agreements
# -----------------------------------------
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
    except (APIError, ConnectionError) as e:
        raise HTTPException(500, f"Database error: {e}")

    return res.data or []

# -----------------------------------------
# Lock Price Agreement
# -----------------------------------------
def lock_price_agreement(price_id: UUID, jwt: str):
    supabase = get_user_client(jwt)

    # Fetch current status
    try:
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
        raise HTTPException(400, f"Cannot lock price with status '{res.data['status']}'")

    try:
        supabase.from_("price_agreements").update(
            {"status": "locked"}
        ).eq("id", str(price_id)).execute()
    except APIError as e:
        raise HTTPException(500, str(e))

    return {"id": str(price_id), "status": "locked"}

# -----------------------------------------
# User-submitted price signal
# -----------------------------------------
def submit_price_signal(jwt: str, user_id: str, market_id: str, size_band_id: str, price_per_kg: float):
    supabase = get_user_client(jwt)

    try:
        supabase.execute(
            """
            INSERT INTO public.price_signals (
              market_id,
              vendor_id,
              size_band_id,
              price_per_kg,
              expires_at
            )
            VALUES (
              :market_id,
              (
                SELECT id FROM public.vendors
                WHERE user_id = :user_id
                LIMIT 1
              ),
              :size_band_id,
              :price_per_kg,
              now() + interval '3 hours'
            )
            """,
            {
                "market_id": market_id,
                "user_id": user_id,
                "size_band_id": size_band_id,
                "price_per_kg": price_per_kg,
            },
        )
    except Exception as e:
        raise HTTPException(500, f"Failed to submit price signal: {e}")

    return {"status": "signal_submitted"}

# -----------------------------------------
# Explain Prices
# -----------------------------------------
def get_price_explain(jwt: str, market_id: str):
    supabase = get_user_client(jwt)

    try:
        rows = supabase.execute(
            """
            SELECT *
            FROM public.price_agreement_explain
            WHERE market_id = :market_id
            ORDER BY size_band
            """,
            {"market_id": market_id},
        ).fetchall()
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch price explanation: {e}")

    return rows
