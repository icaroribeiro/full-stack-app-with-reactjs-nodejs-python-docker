import os
import types
from collections.abc import Iterator

import pytest
from faker import Faker
from fastapi import status
from src.config.config import Config
from src.server_error import ServerError


class TestConfig:
    @pytest.fixture
    def config(self) -> Config:
        return Config()


class TestGetLogLevel(TestConfig):
    @pytest.fixture(autouse=False)
    def log_level(self, fake: Faker) -> Iterator[str]:
        log_level = fake.word()
        os.environ["LOG_LEVEL"] = log_level
        yield log_level
        del os.environ["LOG_LEVEL"]

    def test_should_define_a_method(self, config: Config) -> None:
        assert isinstance(config.get_log_level, types.MethodType) is True

    def test_should_succeed_when_environment_variable_is_defined(
        self, config: Config, log_level: Iterator[str]
    ) -> None:
        expected_result = log_level

        result = config.get_log_level()

        assert result == expected_result

    def test_should_fail_when_environment_variable_is_not_defined(
        self, config: Config
    ) -> None:
        message = "LOG_LEVEL environment variable isn't set"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        with pytest.raises(ServerError) as error:
            config.get_log_level()

        assert error.value.status_code == server_error.status_code
        assert error.value.detail == server_error.detail
        assert error.value.message == server_error.message
