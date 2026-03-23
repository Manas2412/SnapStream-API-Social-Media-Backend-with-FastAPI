from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from fastapi_users import schemas
import uuid


class PostCreate(BaseModel):
    caption: str
    url: str


class PostResponse(BaseModel):
    id: uuid.UUID
    caption: str
    url: str
    file_type: str
    file_name: str
    created_at: datetime
    user_id: uuid.UUID

    class Config:
        from_attributes = True


class UserRead(BaseModel):
    id: uuid.UUID
    name: str
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = False

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    password: str
    is_active: bool | None = True
    is_superuser: bool | None = False
    is_verified: bool | None = False

class UserUpdate(BaseModel):
    password: str | None = None
    name: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None
    is_verified: bool | None = None



    