import types

import pytest
from faker import Faker
from fastapi import status
from sqlalchemy.exc import NoSuchModuleError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
)
from src.config.config import Config
from src.server_error import Detail, ServerError
from src.services.db_service import DBService
from tests.conftest import initialize_database_base


class TestDBService:
    @pytest.fixture
    def db_service(self) -> DBService:
        return DBService()

    @pytest.fixture
    async def initialize_database(self, request, config: Config, db_service: DBService):
        await initialize_database_base(request, config, db_service)


class TestAsyncEngine(TestDBService):
    def test_should_succeed_and_return_async_engine(
        self,
        db_service: DBService,
        initialize_database: None,
    ) -> None:
        result = db_service.async_engine

        assert result is not None
        assert isinstance(result, AsyncEngine)

    def test_should_fail_and_throw_exception_when_async_engine_is_none(
        self,
        db_service: DBService,
    ) -> None:
        message = "Async engine is None!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as error:
            db_service.async_engine

        assert error.value.message == server_error.message
        assert error.value.detail == server_error.detail
        assert error.value.status_code == server_error.status_code
        assert error.value.is_operational == server_error.is_operational


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

    def test_should_fail_and_throw_exception_when_database_url_is_invalid(
        self,
        config: Config,
        db_service: DBService,
        initialize_database: None,
        fake: Faker,
    ) -> None:
        database_url = fake.url("")
        error = NoSuchModuleError("Can't load plugin: sqlalchemy.dialects:https")
        message = "Database connection failed!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            Detail(context=database_url, cause=error),
        )

        with pytest.raises(ServerError) as error:
            db_service.connect_database(database_url)

        assert error.value.message == server_error.message
        assert error.value.detail.context == server_error.detail.context
        assert error.value.detail.cause.args[0] == server_error.detail.cause.args[0]
        assert error.value.status_code == server_error.status_code
        assert error.value.is_operational == server_error.is_operational


class TestCheckDatabaseIsAlive(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.check_database_is_alive, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_true_when_database_is_alive(
        self,
        config: Config,
        db_service: DBService,
        initialize_database: None,
    ) -> None:
        expected_result = True

        result = await db_service.check_database_is_alive()

        assert result == expected_result

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_throw_exception_when_async_engine_is_none(
        self,
        config: Config,
        db_service: DBService,
    ) -> None:
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as error:
            await db_service.check_database_is_alive()

        assert error.value.message == server_error.message
        assert error.value.detail == server_error.detail
        assert error.value.status_code == server_error.status_code
        assert error.value.is_operational == server_error.is_operational


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
    async def test_should_fail_and_throw_exception_when_async_engine_is_none(
        self,
        config: Config,
        db_service: DBService,
    ) -> None:
        alembic_file_path = "alembic.ini"
        message = "Async engine is None!"
        server_error = ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

        with pytest.raises(ServerError) as error:
            await db_service.migrate_database(alembic_file_path)

        assert error.value.message == server_error.message
        assert error.value.detail == server_error.detail
        assert error.value.status_code == server_error.status_code
        assert error.value.is_operational == server_error.is_operational


class TestGetDatabaseTableRowCount(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert (
            isinstance(db_service.get_database_table_row_count, types.MethodType)
            is True
        )


class TestClearDatabaseTable(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.clear_database_tables, types.MethodType) is True


class TestDeleteDatabaseTables(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.delete_database_tables, types.MethodType) is True


class TestDeactivateDatabase(TestDBService):
    def test_should_define_a_method(self, db_service: DBService) -> None:
        assert isinstance(db_service.deactivate_database, types.MethodType) is True
