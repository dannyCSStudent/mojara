from datetime import datetime

from pydantic import BaseModel


class UserOut(BaseModel):
    id: str
    email: str | None = None
    role: str
    vendor_id: str | None = None
    created_at: datetime | None = None
    last_sign_in_at: datetime | None = None


class UserRoleUpdateIn(BaseModel):
    new_role: str


class PaginatedUsersOut(BaseModel):
    items: list[UserOut]
    page: int
    per_page: int
    has_more: bool
