from app.db import get_user_client
from fastapi import HTTPException
from postgrest import APIError


def list_size_bands(jwt: str):
    supabase = get_user_client(jwt)

    try:
        res = (
            supabase
            .from_("size_bands")
            .select("id, label")
            .order("label")
            .execute()
        )
    except (APIError, ConnectionError) as e:
        raise HTTPException(500, f"Database error: {e}")

    return res.data or []
