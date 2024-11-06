from abc import ABC, abstractmethod

from fastapi import status
from src.server_error import ServerError
from src.services.db_service import DBService


class IHealthCheckService(ABC):
    @abstractmethod
    async def check_health(self) -> bool:
        raise Exception("NotImplementedException")


class HealthCheckService(IHealthCheckService):
    def __init__(self, db_service: DBService):
        self.db_service = db_service

    async def check_health(self):
        try:
            await self.db_service.migrate_database()
            return await self.db_service.check_database_is_alive()
        except Exception:
            message = "An error occurred when checking if application is alive"
            print(message)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                # type(
                #     "Detail",
                #     (object,),
                #     {"context": "unknown", "cause": error},
                # ),
            )
