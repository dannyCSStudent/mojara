from prometheus_client import Counter
from prometheus_client import Histogram, Gauge

event_processing_duration = Histogram(
    "event_processing_duration_seconds",
    "Time spent processing an event"
)

event_lag_seconds = Histogram(
    "event_lag_seconds",
    "Time between event creation and processing"
)

queue_depth = Gauge(
    "notification_queue_depth",
    "Number of unprocessed events in queue"
)

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
