import datetime

from pydantic import BaseModel


class UserRequest(BaseModel):
    name: str
    email: str


class User(BaseModel):
    id: str | None = None
    name: str
    email: str
    created_at: datetime.datetime | None = None
    updated_at: datetime.datetime | None = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime.datetime
    updated_at: datetime.datetime | None = None
