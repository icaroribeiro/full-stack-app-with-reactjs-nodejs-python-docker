import pytest

from api.components.health_check.health_check_service import HealthCheckService
from api.components.user.user_repository import UserRepository
from api.components.user.user_service import UserService
from container.container import Container
from services.api_pagination_service import APIPaginationService
from services.db_service import DBService


class TestContainer:
    @pytest.fixture
    def container(
        self,
    ) -> Container:
        return Container()

    def test_should_succeed_when_checking_dependencies_injection(
        self, container: Container
    ) -> None:
        assert isinstance(container.db_service_provider(), DBService) is True
        assert isinstance(container.user_repository_provider(), UserRepository) is True
        assert (
            isinstance(container.health_check_service_provider(), HealthCheckService)
            is True
        )
        assert isinstance(container.user_service_provider(), UserService) is True
        assert (
            isinstance(
                container.api_pagination_service_provider(), APIPaginationService
            )
            is True
        )