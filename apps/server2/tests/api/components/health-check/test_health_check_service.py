import types

import pytest
from fastapi import status
from pytest_mock import MockerFixture
from src.api.components.health_check.health_check_service import HealthCheckService
from src.server_error import Detail, ServerError
from src.services.db_service import DBService


class TestHealthCheckService:
    @pytest.fixture
    def health_check_service(
        self,
        db_service: DBService,
    ) -> HealthCheckService:
        return HealthCheckService(db_service)


class TestCheckHealth(TestHealthCheckService):
    def test_should_define_a_method(
        self,
        health_check_service: HealthCheckService,
    ) -> None:
        assert isinstance(health_check_service.check_health, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_true(
        self,
        db_service: DBService,
        initialize_database: None,
        health_check_service: HealthCheckService,
        mocker: MockerFixture,
    ) -> None:
        mocked_check_database_is_alive = mocker.AsyncMock(return_value=True)
        db_service.check_database_is_alive = mocked_check_database_is_alive
        expected_result = True

        result = await health_check_service.check_health()

        assert result == expected_result
        db_service.check_database_is_alive.assert_called_once()

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_throw_exception_when_health_cannot_be_checked(
        self,
        db_service: DBService,
        health_check_service: HealthCheckService,
        mocker: MockerFixture,
    ) -> None:
        error = Exception("failed")
        message = "An error occurred when checking if application is alive"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            Detail(context="unknown", cause=error.args[0]),
        )
        mocked_check_database_is_alive = mocker.Mock(side_effect=error)
        db_service.check_database_is_alive = mocked_check_database_is_alive

        with pytest.raises(ServerError) as excinfo:
            await health_check_service.check_health()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational
        db_service.check_database_is_alive.assert_called_once()
