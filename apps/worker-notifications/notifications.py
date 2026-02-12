# worker-notifications/notifications.py

async def build_notification_message(db, event):
    """
    Build enriched notification message.
    Can fetch vendor/product info here.
    """

    # Optional enrichment example
    vendor = await db.fetchrow(
        """
        select name
        from vendors
        where id = $1
        """,
        event["vendor_id"],
    )

    vendor_name = vendor["name"] if vendor else "A vendor"

    severity = event["severity"] or 1

    if severity >= 4:
        title = "⚠️ Major Price Update"
    else:
        title = "Price Update"

    body = f"{vendor_name} updated their pricing."

    return title, body

async def create_notification(
    db,
    user_id,
    event_id,
    event_type,
    title,
    body
):
    try:
        await db.execute("""
            insert into notifications (
                user_id,
                event_id,
                event_type,
                title,
                body
            )
            values ($1, $2, $3, $4, $5)
            on conflict (user_id, event_id) do nothing
        """, user_id, event_id, event_type, title, body)

    except Exception as e:
        print("Notification insert failed:", e)

async def create_notifications_bulk(db, rows):
    if not rows:
        return

    await db.executemany("""
        insert into notifications (
            user_id,
            event_id,
            event_type,
            title,
            body
        )
        values ($1, $2, $3, $4, $5)
        on conflict (user_id, event_id) do nothing
    """, rows)
