from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Literal


# -------------------------
# Input
# -------------------------

class NotificationSubscriptionIn(BaseModel):
    market_id: UUID
    event_type: str
    min_severity: int = Field(1, ge=1, le=5)
    channel: Literal["whatsapp"]  # future-proof


# -------------------------
# Output
# -------------------------

class NotificationSubscriptionOut(BaseModel):
    id: UUID
    user_id: UUID
    market_id: UUID
    event_type: str
    min_severity: int
    channel: str
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------
# Notification Output
# -------------------------

class NotificationOut(BaseModel):
    id: UUID
    event_type: str
    title: str
    body: str
    read_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
