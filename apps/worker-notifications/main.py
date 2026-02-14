import asyncio
import signal
import time

from db import get_db
from subscriptions import fetch_matching_subscriptions
from notifications import create_notifications_bulk, build_notification_message
from events import mark_event_processed
from logger import log
from metrics import (
    events_processed,
    events_failed,
    notifications_created,
    event_processing_duration,
    event_lag_seconds,
    queue_depth,
)
from prometheus_client import start_http_server


stop_event = asyncio.Event()
CHANNEL = "price_event_channel"
MAX_RETRIES = 5

DEDUP_WINDOW_MINUTES = 5


# 🔥 Control concurrency (adjust as needed)
semaphore = asyncio.Semaphore(10)


# =========================================================
# LISTEN LOOP
# =========================================================

async def listen():
    listener_conn = await get_db()
    worker_conn = await get_db()

    start_http_server(9100)

    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGTERM, stop_event.set)
    loop.add_signal_handler(signal.SIGINT, stop_event.set)

    log("INFO", "Worker started", channel=CHANNEL)

    await process_backlog(worker_conn)

    await listener_conn.add_listener(
        CHANNEL,
        lambda *args: asyncio.create_task(
            handle_notification(worker_conn, *args)
        )
    )

    await stop_event.wait()
    log("INFO", "Worker shutting down")


# =========================================================
# NOTIFICATION HANDLER
# =========================================================

async def handle_notification(worker_conn, connection, pid, channel, payload):
    try:
        event_id = payload
        log("INFO", "Event received", event_id=event_id)

        async with semaphore:
            event = await worker_conn.fetchrow("""
                select *
                from price_events
                where id = $1
                and processed_at is null
            """, event_id)

            if not event:
                return

            try:
                await process_event(worker_conn, event)
            except Exception as e:
                await handle_failure(worker_conn, event, str(e))

    except Exception as e:
        log("ERROR", "Notification handling failed", error=str(e))


# =========================================================
# PROCESS EVENT
# =========================================================

async def process_event(db, event):
    start_time = time.time()

    async with db.transaction():

        # 🔒 Advisory lock
        lock_acquired = await db.fetchval("""
            select pg_try_advisory_xact_lock(hashtext($1))
        """, str(event["id"]))

        if not lock_acquired:
            log("INFO", "Event locked by another worker", event_id=event["id"])
            return

        fresh_event = await db.fetchrow("""
            select *
            from price_events
            where id = $1
            and processed_at is null
        """, event["id"])

        if not fresh_event:
            return

        # 📊 Event lag metric
        lag = time.time() - fresh_event["created_at"].timestamp()
        event_lag_seconds.observe(lag)

        # Fetch subscriptions
        subs = await fetch_matching_subscriptions(db, fresh_event)

        if not subs:
            await mark_event_processed(db, fresh_event["id"])
            return

        # Build message
        title, body = await build_notification_message(db, fresh_event)

        # Create notifications
        rows = []

        for sub in subs:

            # Severity filter
            if fresh_event["severity"] is not None:
                if fresh_event["severity"] < sub["min_severity"]:
                    continue

            # 🔒 Anti-spam dedupe window
            existing = await db.fetchval("""
                select 1
                from notifications
                where user_id = $1
                and event_type = $2
                and created_at > now() - ($3 || ' minutes')::interval
                limit 1
            """, sub["user_id"], fresh_event["event_type"], DEDUP_WINDOW_MINUTES)

            if existing:
                log(
                    "INFO",
                    "Notification deduped",
                    user_id=sub["user_id"],
                    event_type=fresh_event["event_type"],
                )
                continue

            rows.append((
                sub["user_id"],
                fresh_event["id"],
                fresh_event["event_type"],
                title,
                body,
            ))


        await create_notifications_bulk(db, rows)

        await mark_event_processed(db, fresh_event["id"])

        # 📊 Metrics
        duration = time.time() - start_time
        event_processing_duration.observe(duration)
        events_processed.inc()
        notifications_created.inc(len(rows))

        log(
            "INFO",
            "Event processed",
            event_id=fresh_event["id"],
            notifications=len(rows),
            duration_seconds=round(duration, 4),
        )


# =========================================================
# BACKLOG PROCESSING
# =========================================================

async def process_backlog(db):
    log("INFO", "Processing backlog")

    while True:
        depth = await db.fetchval("""
            select count(*)
            from price_events
            where processed_at is null
        """)

        queue_depth.set(depth)

        if depth == 0:
            break

        events = await db.fetch("""
            select *
            from price_events
            where processed_at is null
            order by created_at asc
            limit 100
        """)

        for event in events:
            try:
                await process_event(db, event)
            except Exception as e:
                await handle_failure(db, event, str(e))

    log("INFO", "Backlog complete")


# =========================================================
# FAILURE HANDLING
# =========================================================

async def handle_failure(db, event, error_message):
    retry_count = event["retry_count"] or 0
    events_failed.inc()

    if retry_count + 1 >= MAX_RETRIES:
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

        log("ERROR", "Event moved to DLQ", event_id=event["id"])
    else:
        await db.execute("""
            update price_events
            set retry_count = retry_count + 1,
                last_error = $2
            where id = $1
        """, event["id"], error_message)

        log(
            "WARNING",
            "Event retry scheduled",
            event_id=event["id"],
            retry=retry_count + 1,
        )


# =========================================================

if __name__ == "__main__":
    asyncio.run(listen())
