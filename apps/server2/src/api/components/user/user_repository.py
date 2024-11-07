from abc import ABC, abstractmethod

from db.models.user import UserModel
from sqlalchemy import insert
from src.api.components.user.user_mapper import UserMapper
from src.api.components.user.user_models import User
from src.api.shared.dict_to_obj import DictToObj
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

    async def create_user(self, user: User) -> User:
        raw_user_data = UserMapper.to_persistence(user)
        async with self.db_service.async_engine.connect() as conn:
            query = insert(UserModel).values(raw_user_data).returning(UserModel)
            result = await conn.execute(query)
            obj = DictToObj(result.first()._asdict())
            await conn.commit()
            return UserMapper.to_domain(obj)
