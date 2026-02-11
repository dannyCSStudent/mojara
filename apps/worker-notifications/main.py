import asyncio
from db import get_db
from events import fetch_unprocessed_events, mark_event_processed
from subscriptions import fetch_matching_subscriptions
from notifications import create_notification


POLL_INTERVAL = 5  # seconds


async def run():
    db = await get_db()
    print("🔔 Notification worker started.")

    while True:
        events = await fetch_unprocessed_events(db)

        for event in events:
            await handle_event(db, event)

        await asyncio.sleep(POLL_INTERVAL)


async def handle_event(db, event):
    # 1️⃣ Find matching subscriptions
    subs = await fetch_matching_subscriptions(db, event)

    # 2️⃣ Create notifications
    for sub in subs:
        await create_notification(
            db=db,
            user_id=sub["user_id"],
            event_type=event["event_type"],
            title=build_title(event),
            body=build_body(event),
        )

    # 3️⃣ Mark event processed
    await mark_event_processed(db, event["id"])


def build_title(event):
    return "Price Update"


def build_body(event):
    vendor_id = event["vendor_id"]
    return f"A vendor you follow updated their pricing."


if __name__ == "__main__":
    asyncio.run(run())
