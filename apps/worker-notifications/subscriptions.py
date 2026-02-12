async def fetch_matching_subscriptions(db, event):
    return await db.fetch("""
        select user_id
        from notification_subscriptions
        where active = true
        and vendor_id = $1
        and event_type = $2
        and min_severity <= $3
    """,
        event["vendor_id"],
        event["event_type"],
        event["severity"],
    )


async def fetch_matching_subscriptions_bulk(db, events):
    if not events:
        return {}

    vendor_ids = list({e["vendor_id"] for e in events})
    event_types = list({e["event_type"] for e in events})

    rows = await db.fetch("""
        select user_id, vendor_id, event_type, min_severity
        from notification_subscriptions
        where active = true
        and vendor_id = any($1)
        and event_type = any($2)
    """, vendor_ids, event_types)

    # Build lookup map
    lookup = {}

    for row in rows:
        key = (row["vendor_id"], row["event_type"])
        lookup.setdefault(key, []).append(row)

    return lookup
