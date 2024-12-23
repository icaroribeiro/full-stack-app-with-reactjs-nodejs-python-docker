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
        try:
            return await self.user_repository.create_user(user)
        except Exception as error:
            message = "An error occurred when creating a new user into database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=user, cause=str(error)),
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
                Detail(context={"page": page, "limit": limit}, cause=str(error)),
            )

    async def retrieve_user(self, user_id: str) -> User:
        retrieved_user: User

        try:
            retrieved_user = await self.user_repository.read_user(user_id)
        except Exception as error:
            message = "An error occurred when reading a user from database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=user_id, cause=str(error)),
            )

        if retrieved_user is None:
            message = "User not found"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context=user_id, cause=None),
            )
        return retrieved_user

    async def replace_user(self, user_id: str, user: User) -> User:
        replaced_user: User
        try:
            replaced_user = await self.user_repository.update_user(user_id, user)
        except Exception as error:
            message = "An error occurred when updating a user in database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context={"user_id": user_id, "user": user}, cause=str(error)),
            )
        if replaced_user is None:
            message = "User not found"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context={"user_id": user_id, "user": user}, cause=None),
            )
        return replaced_user

    async def remove_user(self, user_id: str) -> User:
        removed_user: User
        try:
            removed_user = await self.user_repository.delete_user(user_id)
        except Exception as error:
            message = "An error occurred when deleting a user from database"
            print(message, error)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                Detail(context=user_id, cause=str(error)),
            )
        if removed_user is None:
            message = "User not found"
            print(message)
            raise ServerError(
                message,
                status.HTTP_404_NOT_FOUND,
                Detail(context=user_id, cause=None),
            )
        return removed_user
