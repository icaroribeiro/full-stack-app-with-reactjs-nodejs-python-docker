from dependency_injector import containers, providers
from src.api.components.health_check.health_check_service import HealthCheckService
from src.api.components.user.user_repository import UserRepository
from src.api.components.user.user_service import UserService
from src.services.api_pagination_service import APIPaginationService
from src.services.db_service import DBService


class Container(containers.DeclarativeContainer):
    db_service_provider = providers.Singleton(DBService)
    user_repository_provider = providers.Singleton(
        UserRepository, db_service=db_service_provider
    )
    health_check_service_provider = providers.Singleton(
        HealthCheckService, db_service=db_service_provider
    )
    user_service_provider = providers.Singleton(
        UserService, user_repository=user_repository_provider
    )
    api_pagination_service_provider = providers.Singleton(APIPaginationService)
