from abc import ABC, abstractmethod
from contextlib import asynccontextmanager

from src.api.components.user.user_mapper import UserMapper
from src.api.components.user.user_models import User
from src.services.db_service import DBService


class IUserRepository(ABC):
    @abstractmethod
    async def create_user(self, user: User) -> User:
        raise Exception("NotImplementedException")

    # @abstractmethod
    # async def read_and_count_users(self, page: int, limit: int) -> tuple[UserList, int]:
    #     raise Exception("NotImplementedException")

    # @abstractmethod
    # async def read_user(self, userId: str) -> User:
    #     raise Exception("NotImplementedException")

    # @abstractmethod
    # async def update_user(self, userId: str, user: User) -> User:
    #     raise Exception("NotImplementedException")

    # @abstractmethod
    # async def delete_user(self, userId: str) -> User:
    #     raise Exception("NotImplementedException")


class UserRepository(IUserRepository):
    def __init__(self, db_service: DBService):
        self.db_service = db_service

    @asynccontextmanager
    async def create_user(self, user: User) -> User:
        raw_user_data = UserMapper.to_persistence(user)
        async with self.db_service.session() as session:
            session.(raw_user_data)
        await session.commit()
        await session.refresh(raw_user_data)
        return UserMapper.to_domain(raw_user_data)
