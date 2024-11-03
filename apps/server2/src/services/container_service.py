from dependency_injector import containers, providers

from src.api.components.health.health_check_service import HealthCheckService
from src.services.db_service import DBService

# async def session_factory(conn_string: str):
#     database_session_manager = DatabaseSessionManager(conn_string=conn_string)
#     async with database_session_manager.session() as session:
#         yield session


class Container(containers.DeclarativeContainer):
    db_service = providers.Factory(DBService)
    health_check_service = providers.Factory(HealthCheckService, db_service=db_service)

    # def __init__(self):
    #     self.register_database_container()
    #     self.register_service_container()

    # #     self.db_servddice = None
    # #     self.health_check_service = None
    # def register_database_container(self):
    #     self.db_service = providers.Factory(DBService)

    # def register_service_container(self):
    #     self.health_check_service = providers.Factory(
    #         HealthCheckService, db_service=self.db_service
    #     )


class ContainerService:
    __container: Container

    def __init__(self):
        self.__container = Container()
        # self.register_database_container()
        # # self.register_repository_container()
        # self.register_service_container()

    @property
    def container(self) -> containers.DeclarativeContainer:
        return self.__container
