async def create_notification(
    db,
    user_id,
    event_type,
    title,
    body
):
    await db.execute("""
        insert into notifications (
            user_id,
            event_type,
            title,
            body
        )
        values ($1, $2, $3, $4)
    """, user_id, event_type, title, body)
