from abc import ABC, abstractmethod
from uuid import UUID

from db.models.user import UserModel
from sqlalchemy import delete, desc, insert, select, update
from src.api.components.user.user_mapper import UserMapper
from src.api.components.user.user_models import User
from src.api.shared.dict_to_obj import DictToObj
from src.services.db_service import DBService


class IUserRepository(ABC):
    @abstractmethod
    async def create_user(self, user: User) -> User:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def read_and_count_users(
        self, page: int, limit: int
    ) -> tuple[list[User], int] | None:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def read_user(self, userId: str) -> User | None:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def update_user(self, userId: str, user: User) -> User | None:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def delete_user(self, userId: str) -> User | None:
        raise Exception("NotImplementedException")


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

    async def read_and_count_users(
        self, page: int, limit: int
    ) -> tuple[list[User], int]:
        async with self.db_service.async_engine.connect() as conn:
            paginated_records_subquery = (
                select(UserModel.id)
                .order_by(desc(UserModel.created_at))
                .limit(limit)
                .offset((page - 1) * limit)
                .subquery()
            )
            result = await conn.execute(
                (
                    select(UserModel)
                    .join(
                        paginated_records_subquery,
                        UserModel.id == paginated_records_subquery.c.id,
                    )
                    .order_by(desc(UserModel.created_at))
                )
            )
            paginated_records_result = result.all()
            print("paginated_records_result:", paginated_records_result)

            # result = await conn.execute(select(func.count(UserModel.id).label("count")))
            # obj = DictToObj(result.first()._asdict())
            # total_records_result = obj.count

            # obj = DictToObj(result.first()._asdict())
            # await conn.commit()
            return [[], 0]

    async def read_user(self, userId: str) -> User | None:
        async with self.db_service.async_engine.connect() as conn:
            query = select(UserModel).where(UserModel.id == UUID(userId))
            result = await conn.execute(query)
            if result.rowcount == 0:
                return None
            obj = DictToObj(result.first()._asdict())
            await conn.commit()
            return UserMapper.to_domain(obj)

    async def update_user(self, userId: str, user: User) -> User | None:
        async with self.db_service.async_engine.connect() as conn:
            query = (
                update(UserModel)
                .where(UserModel.id == UUID(userId))
                .values(name=user.name, email=user.email)
                .returning(UserModel)
            )
            result = await conn.execute(query)
            if result.rowcount == 0:
                return None
            obj = DictToObj(result.first()._asdict())
            await conn.commit()
            return UserMapper.to_domain(obj)

    async def delete_user(self, userId: str) -> User | None:
        async with self.db_service.async_engine.connect() as conn:
            query = (
                delete(UserModel)
                .where(UserModel.id == UUID(userId))
                .returning(UserModel)
            )
            result = await conn.execute(query)
            if result.rowcount == 0:
                return None
            obj = DictToObj(result.first()._asdict())
            await conn.commit()
            return UserMapper.to_domain(obj)
