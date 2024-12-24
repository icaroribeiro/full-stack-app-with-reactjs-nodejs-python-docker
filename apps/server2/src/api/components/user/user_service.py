from abc import ABC, abstractmethod

from fastapi import status

from api.components.user.user_models import User
from api.components.user.user_repository import UserRepository
from server_error import Detail, ServerError


class IUserService(ABC):
    @abstractmethod
    async def register_user(self, user: User) -> User:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def retrieve_and_count_users(
        self, page: int, limit: int
    ) -> tuple[list[User], int]:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def retrieve_user(self, user_id: str) -> User:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def replace_user(self, user_id: str, user: User) -> User:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def remove_user(self, user_id: str) -> User:
        raise Exception("NotImplementedException")


class UserService(IUserService):
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def register_user(self, user: User) -> User:
        new_user: User | None

        try:
            new_user = await self.user_repository.create_user(user)
        except Exception as error:
            message = "An error occurred when creating a user"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=user, cause=error),
            )

        if new_user is None:
            message = "User could not be created"
            print(message)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=user, cause=None),
            )

        return new_user

    async def retrieve_and_count_users(
        self, page: int, limit: int
    ) -> tuple[list[User], int]:
        records: list[User] | None
        total: int | None

        try:
            records, total = await self.user_repository.read_and_count_users(
                page, limit
            )
        except Exception as error:
            message = "An error occurred when reading and counting users"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context={"page": page, "limit": limit}, cause=str(error)),
            )

        if records is None or total is None:
            message = "Users could not be read and counted"
            print(message)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context={"page": page, "limit": limit}, cause=None),
            )

        return records, total

    async def retrieve_user(self, user_id: str) -> User:
        user: User | None

        try:
            user = await self.user_repository.read_user(user_id)
        except Exception as error:
            message = "An error occurred when reading a user"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=user_id, cause=str(error)),
            )

        if user is None:
            message = "User could not be read"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context=user_id, cause=None),
            )

        return user

    async def replace_user(self, user_id: str, user: User) -> User:
        user: User | None

        try:
            user = await self.user_repository.update_user(user_id, user)
        except Exception as error:
            message = "An error occurred when updating a user"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context={"user_id": user_id, "user": user}, cause=str(error)),
            )

        if user is None:
            message = "User could not be updated"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context={"user_id": user_id, "user": user}, cause=None),
            )

        return user

    async def remove_user(self, user_id: str) -> User:
        user: User | None

        try:
            user = await self.user_repository.delete_user(user_id)
        except Exception as error:
            message = "An error occurred when deleting a user"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=user_id, cause=str(error)),
            )

        if user is None:
            message = "User could not be removed"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context=user_id, cause=None),
            )

        return user
