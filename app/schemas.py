from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class PostCreate(BaseModel):
    caption: str
    url: str
    file_type: str
    file_name: str


class PostResponse(BaseModel):
    id: UUID
    caption: str
    url: str
    file_type: str
    file_name: str
    created_at: datetime

    class Config:
        orm_mode = True