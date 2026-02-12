import asyncio
import json
from db import get_db
from subscriptions import fetch_matching_subscriptions
from notifications import create_notifications_bulk, build_notification_message
from events import mark_event_processed
from fastapi import FastAPI
import signal
from logger import log
from metrics import (
    events_processed,
    events_failed,
    notifications_created,
)
from prometheus_client import start_http_server


app = FastAPI()
stop_event = asyncio.Event()
CHANNEL = "price_event_channel"
MAX_RETRIES = 5


async def listen():
    db = await get_db()
    start_http_server(9100)

    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGTERM, stop_event.set)
    loop.add_signal_handler(signal.SIGINT, stop_event.set)

    log("INFO", "Worker started", channel=CHANNEL)

    await process_backlog(db)
    await db.add_listener(CHANNEL, handle_notification)

    await stop_event.wait()




async def handle_notification(connection, pid, channel, payload):
    """
    payload = event_id
    """
    try:
        event_id = payload
        log("INFO", "Event received", event_id=event_id)


        event = await connection.fetchrow("""
            select *
            from price_events
            where id = $1
            and processed_at is null
        """, event_id)

        if not event:
            return

        try:
            await process_event(connection, event)
        except Exception as e:
            await handle_failure(connection, event, str(e))



    except Exception as e:
        log("ERROR", "Notification handling failed", error=str(e))


async def process_event(db, event):

    async with db.transaction():

        # 🔒 Try to acquire advisory lock
        lock_acquired = await db.fetchval("""
            select pg_try_advisory_xact_lock(hashtext($1))
        """, str(event["id"]))

        if not lock_acquired:
            print(f"⏭ Event {event['id']} locked by another worker")
            return

        # Double-check still unprocessed
        fresh_event = await db.fetchrow("""
            select *
            from price_events
            where id = $1
            and processed_at is null
        """, event["id"])

        if not fresh_event:
            return

        # 1️⃣ Fetch subscriptions
        subs = await fetch_matching_subscriptions(db, fresh_event)

        if not subs:
            await mark_event_processed(db, fresh_event["id"])
            
            return

        # 2️⃣ Build message
        title, body = await build_notification_message(db, fresh_event)

        # 3️⃣ Create notifications
        rows = []

        for sub in subs:
            if fresh_event["severity"] is not None:
                if fresh_event["severity"] < sub["min_severity"]:
                    continue

            rows.append((
                sub["user_id"],
                fresh_event["id"],
                fresh_event["event_type"],
                title,
                body,
            ))

        await create_notifications_bulk(db, rows)


        # 4️⃣ Mark processed
        await mark_event_processed(db, fresh_event["id"])
        events_processed.inc()
        notifications_created.inc(len(rows))


        print(f"✅ Event {fresh_event['id']} processed safely")


async def process_backlog(db):
    log("INFO", "Processing backlog")

    while True:
        events = await db.fetch("""
            select *
            from price_events
            where processed_at is null
            order by created_at asc
            limit 100
        """)

        if not events:
            break

        for event in events:
            try:
                await process_event(db, event)
            except Exception as e:
                await handle_failure(db, event, str(e))


    print("✅ Backlog complete")


async def handle_failure(db, event, error_message):

    retry_count = event["retry_count"] or 0
    events_failed.inc()

    if retry_count + 1 >= MAX_RETRIES:
        # Move to dead letter
        await db.execute("""
            insert into dead_letter_events (id, original_event, error)
            values ($1, $2, $3)
            on conflict (id) do nothing
        """, event["id"], dict(event), error_message)

        await db.execute("""
            update price_events
            set processed_at = now(),
                failed_at = now(),
                last_error = $2
            where id = $1
        """, event["id"], error_message)

        print(f"💀 Event {event['id']} moved to DLQ")
    else:
        await db.execute("""
            update price_events
            set retry_count = retry_count + 1,
                last_error = $2
            where id = $1
        """, event["id"], error_message)

        print(f"🔁 Retry {retry_count + 1} for event {event['id']}")


if __name__ == "__main__":
    asyncio.run(listen())
