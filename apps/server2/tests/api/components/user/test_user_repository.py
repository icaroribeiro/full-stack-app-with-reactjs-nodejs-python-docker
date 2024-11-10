import types

import pytest
from db.models.user import UserModel
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

    # .create_user
    def test_create_user_should_define_a_method(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        assert isinstance(user_repository.create_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_create_user_should_succeed_and_return_a_created_user(
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

    # .read_user
    def test_read_user_should_define_a_method(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        assert isinstance(user_repository.read_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_read_user_should_succeed_and_return_none_when_no_user_id_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ):
        mocked_user = UserFactory()

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
    ):
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

    # .update_user
    def test_update_user_should_define_a_method(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        assert isinstance(user_repository.update_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_update_user_should_succeed_and_return_none_when_no_user_id_found(
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
    async def test_update_user_should_succeed_and_return_an_updated_user(
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

    # .delete_user
    def test_delete_user_should_define_a_method(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        user_repository: UserRepository,
    ) -> None:
        assert isinstance(user_repository.delete_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_delete_user_should_succeed_and_return_none_when_no_user_id_found(
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
