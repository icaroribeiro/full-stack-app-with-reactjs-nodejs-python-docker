from typing import Any

from src.api.components.user.user_models import User, UserResponse


class UserMapper:
    @staticmethod
    def to_persistence(user: User) -> Any:
        return {"name": user.name, "email": user.email}

    @staticmethod
    def to_domain(raw: Any) -> User:
        return User(
            id=raw.id if hasattr(raw, "id") else None,
            name=raw.name,
            email=raw.email,
            created_at=raw.created_at if hasattr(raw, "created_at") else None,
            updated_at=raw.updated_at if hasattr(raw, "updated_at") else None,
        )

    @staticmethod
    def to_response(user: User) -> UserResponse:
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )