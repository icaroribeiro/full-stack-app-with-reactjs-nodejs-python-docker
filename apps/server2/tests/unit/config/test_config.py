import os
import types
from typing import Generator

import pytest
from faker import Faker
from fastapi import status

from config.config import Config
from server_error import ServerError


class TestConfig:
    @staticmethod
    def setup_and_teardown(var_name: str, var_value: str) -> Generator[str, None, None]:
        exists = False
        if os.environ.get(var_name) is not None:
            exists = True
            var_value = os.environ.get(var_name)
        else:
            os.environ[var_name] = var_value
        yield os.environ.get(var_name)
        if exists:
            os.environ[var_name] = var_value
        else:
            if os.environ.get(var_name) is not None:
                os.environ.pop(var_name)


class TestGetLogLevel(TestConfig):
    @pytest.fixture(autouse=True)
    def log_level(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("LOG_LEVEL", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_log_level, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, log_level: Generator[str, None, None]
    ) -> None:
        expected_result = log_level

        result = config.get_log_level()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("LOG_LEVEL")
        message = "LOG_LEVEL environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_log_level()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetEnv(TestConfig):
    @pytest.fixture(autouse=True)
    def env(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("ENV", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_env, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, env: Generator[str, None, None]
    ) -> None:
        expected_result = env

        result = config.get_env()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("ENV")
        message = "ENV environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_env()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetPort(TestConfig):
    @pytest.fixture(autouse=True)
    def port(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("PORT", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_port, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, port: Generator[str, None, None]
    ) -> None:
        expected_result = port

        result = config.get_port()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("PORT")
        message = "PORT environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_port()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetDatabaseULR(TestConfig):
    @pytest.fixture(autouse=True)
    def database_url(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("DATABASE_URL", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_url, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_url: Generator[str, None, None]
    ) -> None:
        expected_result = database_url

        result = config.get_database_url()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_URL")
        message = "DATABASE_URL environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_database_url()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetDatabaseUsername(TestConfig):
    @pytest.fixture(autouse=True)
    def database_username(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("DATABASE_USERNAME", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_username, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_username: Generator[str, None, None]
    ) -> None:
        expected_result = database_username

        result = config.get_database_username()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_USERNAME")
        message = "DATABASE_USERNAME environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_database_username()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetDatabasePassword(TestConfig):
    @pytest.fixture(autouse=True)
    def database_password(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("DATABASE_PASSWORD", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_password, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_password: Generator[str, None, None]
    ) -> None:
        expected_result = database_password

        result = config.get_database_password()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_PASSWORD")
        message = "DATABASE_PASSWORD environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_database_password()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetDatabaseName(TestConfig):
    @pytest.fixture(autouse=True)
    def database_name(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("DATABASE_NAME", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_name, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_name: Generator[str, None, None]
    ) -> None:
        expected_result = database_name

        result = config.get_database_name()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_NAME")
        message = "DATABASE_NAME environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_database_name()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetDatabasePort(TestConfig):
    @pytest.fixture(autouse=True)
    def database_port(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("DATABASE_PORT", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_port, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_port: Generator[str, None, None]
    ) -> None:
        expected_result = database_port

        result = config.get_database_port()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_PORT")
        message = "DATABASE_PORT environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_database_port()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational


class TestGetAllowedOrigins(TestConfig):
    @pytest.fixture(autouse=True)
    def allowed_origins(self, faker: Faker) -> Generator[str, None, None]:
        yield from self.setup_and_teardown("ALLOWED_ORIGINS", faker.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_allowed_origins, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, allowed_origins: Generator[str, None, None]
    ) -> None:
        expected_result = allowed_origins

        result = config.get_allowed_origins()

        assert result == expected_result

    def test_should_fail_and_raise_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("ALLOWED_ORIGINS")
        message = "ALLOWED_ORIGINS environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as exc_info:
            config.get_allowed_origins()

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
