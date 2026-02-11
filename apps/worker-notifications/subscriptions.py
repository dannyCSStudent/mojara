async def fetch_matching_subscriptions(db, event):
    return await db.fetch("""
        select *
        from notification_subscriptions
        where active = true
        and (
            vendor_id = $1
        )
    """, event["vendor_id"])
