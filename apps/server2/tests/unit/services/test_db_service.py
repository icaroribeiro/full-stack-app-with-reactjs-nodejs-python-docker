import types

import pytest
from db.models.user import UserModel
from faker import Faker
from fastapi import status
from sqlalchemy import insert, text
from sqlalchemy.exc import NoSuchModuleError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
)
from tests.conftest import initialize_database_base
from tests.factories.user_factory import UserFactory

from api.components.user.user_mapper import UserMapper
from api.components.user.user_models import User
from api.utils.dict_to_obj import DictToObj
from config.config import Config
from server_error import Detail, ServerError
from services.db_service import DBService


class TestDBService:
    @pytest.fixture
    def db_service(self) -> DBService:
        return DBService()

    @pytest.fixture
    async def initialize_database(
        self, request, config: Config, db_service: DBService
    ) -> None:
        await initialize_database_base(request, config, db_service)


class TestAsyncEngine(TestDBService):
    def test_should_succeed_and_return_async_engine(
        self,
        db_service: DBService,
        initialize_database: None,
    ) -> None:
        result = db_service.async_engine

        assert result is not None
        assert isinstance(result, AsyncEngine) is True

    def test_should_fail_and_raise_exception_when_async_engine_is_none(
        self,
        db_service: DBService,
    ) -> None:
        message = "Async engine is None!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            db_service.async_engine

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestConnectDatabase(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.connect_database, types.MethodType) is True

    def test_should_succeed_and_return_none_when_async_engine_is_created(
        self,
        config: Config,
        db_service: DBService,
        initialize_database: None,
    ) -> None:
        database_url = config.get_database_url()

        result = db_service.connect_database(database_url)

        assert result is None
        assert db_service.async_engine is not None

    def test_should_fail_and_raise_exception_when_database_url_is_invalid(
        self,
        db_service: DBService,
        initialize_database: None,
        faker: Faker,
    ) -> None:
        database_url = faker.url("")
        error = NoSuchModuleError(
            f"Could not parse SQLAlchemy URL from string '{database_url}'"
        )
        message = "An error occurred when connecting to database!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            Detail(context=database_url, cause=str(error)),
        )

        with pytest.raises(ServerError) as exc_info:
            db_service.connect_database(database_url)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail.context == server_error.detail.context
        assert exc_info.value.detail.cause == server_error.detail.cause
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestCheckDatabaseIsAlive(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.check_database_is_alive, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_true_when_database_is_alive(
        self,
        db_service: DBService,
        initialize_database: None,
    ) -> None:
        expected_result = True

        result = await db_service.check_database_is_alive()

        assert result == expected_result

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_async_engine_is_none(
        self,
        db_service: DBService,
    ) -> None:
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as exc_info:
            await db_service.check_database_is_alive()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestMigrateDatabase(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.migrate_database, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_none_when_database_is_migrated(
        self,
        config: Config,
        db_service: DBService,
    ) -> None:
        db_service.connect_database(config.get_database_url())
        alembic_file_path = "alembic.ini"

        result = await db_service.migrate_database(alembic_file_path)

        assert result is None
        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        await db_service.delete_database_tables()
        await db_service.deactivate_database()

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_alembic_file_is_not_found(
        self,
        config: Config,
        db_service: DBService,
        faker: Faker,
    ) -> None:
        db_service.connect_database(config.get_database_url())
        alembic_file_path = faker.file_path()
        message = "An error occurred when migrating the database"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as exc_info:
            await db_service.migrate_database(alembic_file_path)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_async_engine_is_none(
        self,
        db_service: DBService,
    ) -> None:
        alembic_file_path = "alembic.ini"
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as exc_info:
            await db_service.migrate_database(alembic_file_path)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetDatabaseTableRowCount(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert (
            isinstance(db_service.get_database_table_row_count, types.MethodType)
            is True
        )

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_number_of_database_table_rows(
        self,
        config: Config,
        db_service: DBService,
    ) -> None:
        name = "users"
        db_service.connect_database(config.get_database_url())
        alembic_file_path = "alembic.ini"
        await db_service.migrate_database(alembic_file_path)
        count = 3
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
        expected_result = count

        result = await db_service.get_database_table_row_count(name)

        assert result == expected_result
        await db_service.delete_database_tables()
        await db_service.deactivate_database()

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_database_table_does_not_exist(
        self,
        config: Config,
        db_service: DBService,
        faker: Faker,
    ) -> None:
        name = faker.word()
        db_service.connect_database(config.get_database_url())
        alembic_file_path = "alembic.ini"
        await db_service.migrate_database(alembic_file_path)
        message = f"An error occurred when counting rows of database table {name}"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as exc_info:
            await db_service.get_database_table_row_count(name)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_async_engine_is_none(
        self, db_service: DBService, faker: Faker
    ) -> None:
        name = faker.name()
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as exc_info:
            await db_service.get_database_table_row_count(name)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestClearDatabaseTable(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.clear_database_tables, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_none_when_database_tables_are_cleaned(
        self,
        config: Config,
        db_service: DBService,
    ) -> None:
        name = "users"
        db_service.connect_database(config.get_database_url())
        alembic_file_path = "alembic.ini"
        await db_service.migrate_database(alembic_file_path)
        count = 3
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
        assert await db_service.get_database_table_row_count(name) == count
        expected_result = 0

        result = await db_service.clear_database_tables()

        assert result is None
        assert await db_service.get_database_table_row_count(name) == expected_result
        await db_service.delete_database_tables()
        await db_service.deactivate_database()

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_async_engine_is_none(
        self, db_service: DBService
    ) -> None:
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as exc_info:
            await db_service.clear_database_tables()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestDeleteDatabaseTables(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.delete_database_tables, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_none_when_database_tables_are_deleted(
        self,
        config: Config,
        db_service: DBService,
    ) -> None:
        db_service.connect_database(config.get_database_url())
        alembic_file_path = "alembic.ini"
        await db_service.migrate_database(alembic_file_path)

        result = await db_service.delete_database_tables()

        assert result is None
        async with db_service.async_engine.connect() as conn:
            query = text("""
                SELECT table_name
                FROM information_schema.tables
                    WHERE table_schema = 'public'
                        AND table_type = 'BASE TABLE';
            """)
            result = await conn.execute(query)
            assert len(result.fetchall()) == 0
            await conn.commit()
        await db_service.deactivate_database()

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_async_engine_is_none(
        self, db_service: DBService
    ) -> None:
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as exc_info:
            await db_service.delete_database_tables()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestDeactivateDatabase(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.deactivate_database, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_none_when_database_is_deactivated(
        self,
        config: Config,
        db_service: DBService,
    ) -> None:
        db_service.connect_database(config.get_database_url())

        result = await db_service.deactivate_database()

        assert result is None
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
        with pytest.raises(ServerError) as exc_info:
            await db_service.async_engine()
        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_async_engine_is_none(
        self, db_service: DBService
    ) -> None:
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as exc_info:
            await db_service.deactivate_database()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
