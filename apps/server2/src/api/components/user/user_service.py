from abc import ABC, abstractmethod

from fastapi import status
from src.api.components.user.user_models import User
from src.api.components.user.user_repository import UserRepository
from src.server_error import Detail, ServerError


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
    async def retrieve_user(self, userId: str) -> User:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def replace_user(self, userId: str, user: User) -> User:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def remove_user(self, userId: str) -> User:
        raise Exception("NotImplementedException")


class UserService(IUserService):
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def register_user(self, user: User) -> User:
        try:
            return await self.user_repository.create_user(user)
        except Exception as error:
            message = "An error occurred when creating a new user into database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=user, cause=error.args[0]),
            )

    async def retrieve_and_count_users(
        self, page: int, limit: int
    ) -> tuple[list[User], int]:
        try:
            return await self.user_repository.read_and_count_users(page, limit)
        except Exception as error:
            message = "An error occurred when reading and counting users from database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context={"page": page, "limit": limit}, cause=error.args[0]),
            )

    async def retrieve_user(self, userId: str) -> User:
        retrieved_user: User
        try:
            retrieved_user = await self.user_repository.read_user(userId)
        except Exception as error:
            message = "An error occurred when reading a user from database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=userId, cause=error.args[0]),
            )
        if retrieved_user is None:
            message = "User not found"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context=userId, cause=None),
            )
        return retrieved_user

    async def replace_user(self, userId: str, user: User) -> User:
        replaced_user: User
        try:
            replaced_user = await self.user_repository.update_user(userId, user)
        except Exception as error:
            message = "An error occurred when updating a user in database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context={"userId": userId, "user": user}, cause=error.args[0]),
            )
        if replaced_user is None:
            message = "User not found"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context={"userId": userId, "user": user}, cause=None),
            )
        return replaced_user

    async def remove_user(self, userId: str) -> User:
        removed_user: User
        try:
            removed_user = await self.user_repository.delete_user(userId)
        except Exception as error:
            message = "An error occurred when deleting a user from database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=userId, cause=error.args[0]),
            )
        if removed_user is None:
            message = "User not found"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context=userId, cause=None),
            )
        return removed_user
