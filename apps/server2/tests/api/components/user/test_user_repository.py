import types

import pytest
from db.models.user import UserModel
from faker import Faker
from sqlalchemy import insert
from src.api.components.user.user_mapper import UserMapper
from src.api.components.user.user_repository import UserRepository
from src.api.shared.dict_to_obj import DictToObj
from src.services.db_service import DBService
from tests.factories.user_factory import UserFactory


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
    async def test_should_succeed_and_return_a_created_user(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user = UserFactory()
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
    async def test_should_succeed_and_return_an_empty_list_of_user_with_zero_total(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
        fake: Faker,
    ):
        page = fake.pyint()
        limit = fake.pyint()
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

    # @pytest.mark.asyncio(loop_scope="session")
    # async def test_read_and_count_users_should_succeed_and_return_a_list_of_users_with_non_zero_total_when_page_is_the_first_one_and_can_be_filled(
    #     self,
    #     db_service: DBService,
    #     initialize_database: None,
    #     clear_database_tables: None,
    #     user_repository: UserRepository,
    # ):
    #     page = 1
    #     limit = 1
    #     expected_paginated_records_result: list[User] = []
    #     expected_total_records_result = 0

    #     (
    #         paginated_records_result,
    #         total_records_result,
    #     ) = await user_repository.read_and_count_users(page, limit)

    #     row_count = 0
    #     assert await db_service.get_database_table_row_count("users") == row_count
    #     assert paginated_records_result == expected_paginated_records_result
    #     assert total_records_result == expected_total_records_result


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
    async def test_should_succeed_and_return_none_when_user_is_not_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        mocked_user = UserFactory.build()

        result = await user_repository.read_user(mocked_user.id)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result is None

    @pytest.mark.asyncio(loop_scope="session")
    async def test_read_user_should_succeed_and_return_a_user(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        mocked_user = UserFactory()
        raw_user_data = UserMapper.to_persistence(UserMapper.to_domain(mocked_user))
        async with db_service.async_engine.connect() as conn:
            query = insert(UserModel).values(raw_user_data).returning(UserModel)
            engine_result = await conn.execute(query)
            obj = DictToObj(engine_result.first()._asdict())
            await conn.commit()
        mocked_user.id = UserMapper.to_domain(obj).id
        expected_result = mocked_user

        result = await user_repository.read_user(mocked_user.id)

        row_count = 1
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result.id == expected_result.id
        assert result.name == expected_result.name
        assert result.email == expected_result.email
        assert result.created_at is not None
        assert result.updated_at is None


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
    async def test_should_succeed_and_return_none_when_user_is_not_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user = UserFactory()
        mocked_updated_user = UserMapper.to_domain(UserFactory())

        result = await user_repository.update_user(mocked_user.id, mocked_updated_user)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result is None

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_an_updated_user(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user = UserFactory()
        raw_user_data = UserMapper.to_persistence(UserMapper.to_domain(mocked_user))
        async with db_service.async_engine.connect() as conn:
            query = insert(UserModel).values(raw_user_data).returning(UserModel)
            engine_result = await conn.execute(query)
            obj = DictToObj(engine_result.first()._asdict())
            await conn.commit()
        mocked_user.id = obj.id
        mocked_updated_user = UserFactory()
        mocked_updated_user.id = mocked_user.id
        expected_result = mocked_updated_user

        result = await user_repository.update_user(mocked_user.id, mocked_updated_user)

        row_count = 1
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result.id == expected_result.id
        assert result.name == expected_result.name
        assert result.email == expected_result.email
        assert result.created_at is not None
        assert result.updated_at is not None


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
    async def test_should_succeed_and_return_none_when_user_is_not_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user = UserFactory()

        result = await user_repository.delete_user(mocked_user.id)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result is None

    @pytest.mark.asyncio(loop_scope="session")
    async def test_delete_user_should_succeed_and_return_a_delete_user(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user = UserFactory()
        raw_user_data = UserMapper.to_persistence(UserMapper.to_domain(mocked_user))
        async with db_service.async_engine.connect() as conn:
            query = insert(UserModel).values(raw_user_data).returning(UserModel)
            engine_result = await conn.execute(query)
            obj = DictToObj(engine_result.first()._asdict())
            await conn.commit()
        mocked_user.id = obj.id
        expected_result = mocked_user

        result = await user_repository.delete_user(mocked_user.id)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert result.id == expected_result.id
        assert result.name == expected_result.name
        assert result.email == expected_result.email
        assert result.created_at is not None
        assert result.updated_at is None
