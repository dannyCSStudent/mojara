from prometheus_client import Counter

events_processed = Counter(
    "events_processed_total",
    "Total number of processed events"
)

events_failed = Counter(
    "events_failed_total",
    "Total number of failed events"
)

notifications_created = Counter(
    "notifications_created_total",
    "Total number of notifications created"
)
