from pydantic import BaseModel
from uuid import UUID


class SizeBandOut(BaseModel):
    id: UUID
    label: str
