from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from postgrest import APIError

from app.db import get_service_client


TREND_WINDOW_DAYS = 30


def _count_rows(table: str, *, filters: list[tuple[str, str, str]] | None = None) -> int:
    client = get_service_client()
    query = client.table(table).select("*", count="exact", head=True)

    for filter_name, field, value in filters or []:
        query = getattr(query, filter_name)(field, value)

    result = query.execute()
    return result.count or 0


def get_admin_overview():
    now = datetime.now(timezone.utc)
    start_7d = (now - timedelta(days=7)).isoformat()
    start_today = datetime.combine(
        now.date(),
        datetime.min.time(),
        tzinfo=timezone.utc,
    ).isoformat()

    try:
        return {
            "total_orders_7d": _count_rows(
                "orders",
                filters=[("gte", "created_at", start_7d)],
            ),
            "orders_today": _count_rows(
                "orders",
                filters=[("gte", "created_at", start_today)],
            ),
            "active_vendors": _count_rows("vendors"),
            "active_price_agreements": _count_rows("active_price_agreements"),
            "pending_orders": _count_rows(
                "orders",
                filters=[("eq", "status", "pending")],
            ),
        }
    except (APIError, ConnectionError) as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load admin overview: {exc}")


def get_admin_orders_trend():
    client = get_service_client()
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=TREND_WINDOW_DAYS - 1)).date()

    try:
        result = (
            client.table("orders")
            .select("created_at")
            .gte("created_at", datetime.combine(start, datetime.min.time(), tzinfo=timezone.utc).isoformat())
            .order("created_at")
            .execute()
        )
    except (APIError, ConnectionError) as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load orders trend: {exc}")

    counts = Counter()

    for row in result.data or []:
        created_at = row.get("created_at")
        if not created_at:
            continue
        counts[created_at[:10]] += 1

    trend = []
    for offset in range(TREND_WINDOW_DAYS):
        day = start + timedelta(days=offset)
        day_str = day.isoformat()
        trend.append({"date": day_str, "count": counts.get(day_str, 0)})

    return trend
