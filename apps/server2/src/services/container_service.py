import logging
from typing import Optional

from dependency_injector import containers, providers
from fastapi import status

from src.api.components.health.health_check_service import HealthCheckService
from src.server_error import ServerError
from src.services.db_service import DBService

logger = logging.getLogger(__name__)

# async def session_factory(conn_string: str):
#     database_session_manager = DatabaseSessionManager(conn_string=conn_string)
#     async with database_session_manager.session() as session:
#         yield session


class Container(containers.DeclarativeContainer):
    db_service = providers.Factory(DBService)
    health_check_service = providers.Factory(HealthCheckService, db_service=db_service)


class ContainerService:
    __container: Optional[Container] = None

    def __init__(self):
        self.__container = None

    @property
    def container(self) -> Container:
        if self.__container is not None:
            return self.__container
        message = "Container is None!"
        logger.error(message)
        raise ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    def initialize_container(self):
        self.__container = Container()
