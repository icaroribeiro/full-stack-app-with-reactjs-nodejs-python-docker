from pydantic import BaseModel


class UserRequest(BaseModel):
    name: str
    email: str


class User(BaseModel):
    id: str | None = None
    name: str
    email: str


UserList: list[User]


class UserResponse(BaseModel):
    id: str
    name: str
    email: str


UserListResponse: list[UserResponse]
