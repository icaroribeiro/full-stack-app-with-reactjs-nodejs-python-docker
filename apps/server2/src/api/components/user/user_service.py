from abc import ABC, abstractmethod

from fastapi import status
from src.api.components.user.user_models import User
from src.api.components.user.user_repository import UserRepository
from src.server_error import ServerError


class IUserService(ABC):
    @abstractmethod
    async def register_user(self, user: User) -> User:
        raise Exception("NotImplementedException")

    # @abstractmethod
    # async def retrieve_and_count_users(
    #     self, page: int, limit: int
    # ) -> tuple[UserList, int]:
    #     raise Exception("NotImplementedException")

    # @abstractmethod
    # async def retrieve_user(self, userId: str) -> User:
    #     raise Exception("NotImplementedException")

    # @abstractmethod
    # async def replace_user(self, userId: str, user: User) -> User:
    #     raise Exception("NotImplementedException")

    # @abstractmethod
    # async def remove_user(self, userId: str) -> User:
    #     raise Exception("NotImplementedException")


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
                # type(
                #     "Detail",
                #     (object,),
                #     {"context": "unknown", "cause": error},
                # ),
            )