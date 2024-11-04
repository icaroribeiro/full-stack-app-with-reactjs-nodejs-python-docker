from dependency_injector import containers, providers

from src.api.components.health.health_check_service import HealthCheckService
from src.services.db_service import DBService


class Container(containers.DeclarativeContainer):
    db_service_provider = providers.Singleton(DBService)
    health_check_service_provider = providers.Singleton(
        HealthCheckService, db_service=db_service_provider
    )
