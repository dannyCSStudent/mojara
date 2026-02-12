from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Literal


# -------------------------
# Allowed event types
# -------------------------

EventType = Literal[
    "price_increase",
    "price_decrease",
]


# -------------------------
# Input
# -------------------------

class NotificationSubscriptionIn(BaseModel):
    vendor_id: UUID
    event_type: EventType
    channel: Literal["push", "whatsapp"] = "push"


# -------------------------
# Output
# -------------------------

class NotificationSubscriptionOut(BaseModel):
    id: UUID
    user_id: UUID
    vendor_id: UUID
    event_type: EventType
    channel: str
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# Notification Output
# -------------------------

class NotificationOut(BaseModel):
    id: UUID
    event_type: EventType
    title: str
    body: str
    read_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
