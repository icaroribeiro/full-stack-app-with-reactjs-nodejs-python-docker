import os
import types
from collections.abc import Iterator

import pytest
from faker import Faker
from fastapi import status
from src.config.config import Config
from src.server_error import ServerError


class TestConfig:
    # @pytest.fixture
    # def config(self) -> Config:
    #     return Config()

    @staticmethod
    def setup_and_teardown(name: str, input_value: str) -> Iterator[str]:
        exists = False
        value = ""
        if os.environ.get(name) is not None:
            exists = True
            value = os.environ.get(name)
        else:
            os.environ[name] = input_value
        yield os.environ.get(name)
        if exists:
            os.environ[name] = value
        else:
            if os.environ.get(name) is not None:
                os.environ.pop(name)


class TestGetLogLevel(TestConfig):
    @pytest.fixture(autouse=True)
    def log_level(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("LOG_LEVEL", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_log_level, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, log_level: Iterator[str]
    ) -> None:
        expected_result = log_level

        result = config.get_log_level()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("LOG_LEVEL")
        message = "LOG_LEVEL environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_log_level()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetEnv(TestConfig):
    @pytest.fixture(autouse=True)
    def env(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("ENV", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_env, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, env: Iterator[str]
    ) -> None:
        expected_result = env

        result = config.get_env()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("ENV")
        message = "ENV environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_env()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetPort(TestConfig):
    @pytest.fixture(autouse=True)
    def port(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("PORT", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_port, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, port: Iterator[str]
    ) -> None:
        expected_result = port

        result = config.get_port()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("PORT")
        message = "PORT environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_port()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetOpenAPIURL(TestConfig):
    @pytest.fixture(autouse=True)
    def openapi_url(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("OPENAPI_URL", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_openapi_url, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, openapi_url: Iterator[str]
    ) -> None:
        expected_result = openapi_url

        result = config.get_openapi_url()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("OPENAPI_URL")
        message = "OPENAPI_URL environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_openapi_url()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetDocsURL(TestConfig):
    @pytest.fixture(autouse=True)
    def docs_url(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("DOCS_URL", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_docs_url, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, docs_url: Iterator[str]
    ) -> None:
        expected_result = docs_url

        result = config.get_docs_url()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DOCS_URL")
        message = "DOCS_URL environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_docs_url()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetDatabaseULR(TestConfig):
    @pytest.fixture(autouse=True)
    def database_url(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("DATABASE_URL", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_url, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_url: Iterator[str]
    ) -> None:
        expected_result = database_url

        result = config.get_database_url()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_URL")
        message = "DATABASE_URL environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_database_url()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetDatabaseUsername(TestConfig):
    @pytest.fixture(autouse=True)
    def database_username(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("DATABASE_USERNAME", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_username, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_username: Iterator[str]
    ) -> None:
        expected_result = database_username

        result = config.get_database_username()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_USERNAME")
        message = "DATABASE_USERNAME environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_database_username()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetDatabasePassword(TestConfig):
    @pytest.fixture(autouse=True)
    def database_password(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("DATABASE_PASSWORD", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_password, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_password: Iterator[str]
    ) -> None:
        expected_result = database_password

        result = config.get_database_password()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_PASSWORD")
        message = "DATABASE_PASSWORD environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_database_password()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetDatabaseName(TestConfig):
    @pytest.fixture(autouse=True)
    def database_name(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("DATABASE_NAME", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_name, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_name: Iterator[str]
    ) -> None:
        expected_result = database_name

        result = config.get_database_name()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_NAME")
        message = "DATABASE_NAME environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_database_name()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetDatabasePort(TestConfig):
    @pytest.fixture(autouse=True)
    def database_port(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("DATABASE_PORT", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_database_port, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, database_port: Iterator[str]
    ) -> None:
        expected_result = database_port

        result = config.get_database_port()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("DATABASE_PORT")
        message = "DATABASE_PORT environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_database_port()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational


class TestGetAllowedOrigins(TestConfig):
    @pytest.fixture(autouse=True)
    def allowed_origins(self, fake: Faker) -> Iterator[str]:
        yield from self.setup_and_teardown("ALLOWED_ORIGINS", fake.pystr())

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_allowed_origins, types.MethodType) is True

    def test_should_succeed_and_return_environment_variable_when_it_is_set(
        self, config: Config, allowed_origins: Iterator[str]
    ) -> None:
        expected_result = allowed_origins

        result = config.get_allowed_origins()

        assert result == expected_result

    def test_should_fail_and_throw_exception_when_environment_variable_is_not_set(
        self, config: Config
    ) -> None:
        os.environ.pop("ALLOWED_ORIGINS")
        message = "ALLOWED_ORIGINS environment variable isn't set!"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as excinfo:
            config.get_allowed_origins()

        assert excinfo.value.message == server_error.message
        assert excinfo.value.detail == server_error.detail
        assert excinfo.value.status_code == server_error.status_code
        assert excinfo.value.is_operational == server_error.is_operational
