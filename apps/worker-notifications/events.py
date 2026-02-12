async def fetch_unprocessed_events(db):
    return await db.fetch("""
        select *
        from price_events
        where processed_at is null
        order by created_at asc
        limit 50
    """)


async def mark_event_processed(db, event_id):
    await db.execute("""
        update price_events
        set processed_at = now()
        where id = $1
        and processed_at is null

    """, event_id)


async def mark_events_processed_bulk(db, event_ids):
    if not event_ids:
        return

    await db.execute("""
        update price_events
        set processed_at = now()
        where id = any($1)
    """, event_ids)

