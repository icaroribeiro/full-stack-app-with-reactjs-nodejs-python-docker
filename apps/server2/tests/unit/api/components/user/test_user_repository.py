import types

import pytest
from db.models.user import UserModel
from faker import Faker
from sqlalchemy import insert
from tests.factories.user_factory import UserFactory

from api.components.user.user_mapper import UserMapper
from api.components.user.user_models import User
from api.components.user.user_repository import UserRepository
from api.utils.dict_to_obj import DictToObj
from services.db_service import DBService


class TestUserRepository:
    @pytest.fixture
    def user_repository(self, db_service: DBService) -> UserRepository:
        return UserRepository(db_service)


class TestCreateUser(TestUserRepository):
    def test_should_define_a_method(
        self,
        user_repository: UserRepository,
    ) -> None:
        assert isinstance(user_repository.create_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_user_when_user_is_created(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user: UserModel = UserFactory.build()
        expected_result = UserMapper.to_domain(mocked_user)

        result = await user_repository.create_user(mocked_user)

        row_count = 1
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result.id is not None
        assert result.name == expected_result.name
        assert result.email == expected_result.email
        assert result.created_at is not None
        assert result.updated_at is None


class TestReadAndCountUsers(TestUserRepository):
    def test_should_define_a_method(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        assert (
            isinstance(user_repository.read_and_count_users, types.MethodType) is True
        )

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_empty_list_of_user_with_zero_total_when_users_do_not_exist(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
        faker: Faker,
    ):
        page = faker.pyint()
        limit = faker.pyint()
        expected_records_result = []
        expected_total_result = 0

        (
            records_result,
            total_result,
        ) = await user_repository.read_and_count_users(page, limit)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert (records_result, total_result) == (
            expected_records_result,
            expected_total_result,
        )

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_list_of_users_with_non_zero_total_when_page_is_the_first_and_can_be_filled(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        count = 3
        mocked_user_list: list[UserModel] = UserFactory.build_batch(count)
        domain_user_list: list[User] = []
        for mocked_user in mocked_user_list:
            raw_user_data = UserMapper.to_persistence(mocked_user)
            async with db_service.async_engine.connect() as conn:
                query = insert(UserModel).values(raw_user_data).returning(UserModel)
                engine_result = await conn.execute(query)
                obj = DictToObj(engine_result.first()._asdict())
                await conn.commit()
                domain_user_list.append(UserMapper.to_domain(obj))
        page = 1
        limit = 1
        expected_records_result: list[User] = [
            domain_user_list[len(domain_user_list) - 1]
        ]
        expected_total_result = count

        (
            records_result,
            total_result,
        ) = await user_repository.read_and_count_users(page, limit)

        row_count = count
        assert await db_service.get_database_table_row_count("users") == row_count
        assert records_result == expected_records_result
        assert total_result == expected_total_result

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_empty_list_of_users_with_non_zero_total_when_page_is_not_the_first_and_cannot_be_filled(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        count = 3
        mocked_user_list: list[UserModel] = UserFactory.build_batch(count)
        domain_user_list: list[User] = []
        for mocked_user in mocked_user_list:
            raw_user_data = UserMapper.to_persistence(mocked_user)
            async with db_service.async_engine.connect() as conn:
                query = insert(UserModel).values(raw_user_data).returning(UserModel)
                engine_result = await conn.execute(query)
                obj = DictToObj(engine_result.first()._asdict())
                await conn.commit()
                domain_user_list.append(UserMapper.to_domain(obj))
        page = 2
        limit = 3
        expected_records_result: list[User] = []
        expected_total_result = count

        (
            records_result,
            total_result,
        ) = await user_repository.read_and_count_users(page, limit)

        row_count = count
        assert await db_service.get_database_table_row_count("users") == row_count
        assert records_result == expected_records_result
        assert total_result == expected_total_result

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_list_of_users_with_non_zero_total_when_page_is_not_the_first_and_can_be_filled(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        count = 5
        mocked_user_list = UserFactory.build_batch(count)
        domain_user_list: list[User] = []
        for mocked_user in mocked_user_list:
            raw_user_data = UserMapper.to_persistence(mocked_user)
            async with db_service.async_engine.connect() as conn:
                query = insert(UserModel).values(raw_user_data).returning(UserModel)
                engine_result = await conn.execute(query)
                obj = DictToObj(engine_result.first()._asdict())
                await conn.commit()
                domain_user_list.append(UserMapper.to_domain(obj))
        page = 3
        limit = 2
        expected_records_result: list[User] = [domain_user_list[0]]
        expected_total_result = count

        (
            records_result,
            total_result,
        ) = await user_repository.read_and_count_users(page, limit)

        row_count = count
        assert await db_service.get_database_table_row_count("users") == row_count
        assert records_result == expected_records_result
        assert total_result == expected_total_result


class TestReadUser(TestUserRepository):
    def test_should_define_a_method(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        assert isinstance(user_repository.read_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_user_when_user_is_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        raw_user_data = UserMapper.to_persistence(UserMapper.to_domain(mocked_user))
        domain_user: User
        async with db_service.async_engine.connect() as conn:
            query = insert(UserModel).values(raw_user_data).returning(UserModel)
            engine_result = await conn.execute(query)
            obj = DictToObj(engine_result.first()._asdict())
            await conn.commit()
            domain_user = UserMapper.to_domain(obj)
        mocked_user.id = domain_user.id
        expected_result = domain_user

        result = await user_repository.read_user(mocked_user.id)

        row_count = 1
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result == expected_result

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_none_when_user_is_not_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()

        result = await user_repository.read_user(mocked_user.id)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result is None


class TestUpdateUser(TestUserRepository):
    def test_should_define_a_method(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        assert isinstance(user_repository.update_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_user_when_user_is_updated(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user: UserModel = UserFactory.build()
        raw_user_data = UserMapper.to_persistence(UserMapper.to_domain(mocked_user))
        domain_user: User
        async with db_service.async_engine.connect() as conn:
            query = insert(UserModel).values(raw_user_data).returning(UserModel)
            engine_result = await conn.execute(query)
            obj = DictToObj(engine_result.first()._asdict())
            await conn.commit()
            domain_user: User = UserMapper.to_domain(
                UserFactory.build(id=obj.id, created_at=obj.created_at)
            )
        mocked_user.id = domain_user.id
        expected_result = domain_user

        result = await user_repository.update_user(mocked_user.id, domain_user)

        row_count = 1
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result.id == expected_result.id
        assert result.name == expected_result.name
        assert result.email == expected_result.email
        assert result.created_at == expected_result.created_at
        assert result.updated_at is not None

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_none_when_user_is_not_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user: UserModel = UserFactory.build()
        domain_user: User = UserMapper.to_domain(UserFactory.build())

        result = await user_repository.update_user(mocked_user.id, domain_user)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result is None


class TestDeleteUser(TestUserRepository):
    def test_should_define_a_method(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        assert isinstance(user_repository.delete_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_user_when_user_is_deleted(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user: UserModel = UserFactory.build()
        raw_user_data = UserMapper.to_persistence(UserMapper.to_domain(mocked_user))
        domain_user: User
        async with db_service.async_engine.connect() as conn:
            query = insert(UserModel).values(raw_user_data).returning(UserModel)
            engine_result = await conn.execute(query)
            obj = DictToObj(engine_result.first()._asdict())
            await conn.commit()
            domain_user = UserMapper.to_domain(obj)
        mocked_user.id = domain_user.id
        expected_result = domain_user

        result = await user_repository.delete_user(mocked_user.id)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result == expected_result

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_none_when_user_is_not_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user: UserModel = UserFactory.build()

        result = await user_repository.delete_user(mocked_user.id)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result is None
