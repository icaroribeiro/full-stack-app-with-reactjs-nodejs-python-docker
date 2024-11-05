from typing import Any

from src.api.components.user.user_models import User, UserResponse


class UserMapper:
    def to_persistence(user: User) -> Any:
        return {"name": user.name, "email": user.email}

    def to_domain(raw: Any) -> User:
        return User(id=raw.id, name=raw.name, email=raw.email)

    @staticmethod
    def to_response(user: User) -> UserResponse:
        return UserResponse(
            id=user.id if user.id else "unknown", name=user.name, email=user.email
        )
