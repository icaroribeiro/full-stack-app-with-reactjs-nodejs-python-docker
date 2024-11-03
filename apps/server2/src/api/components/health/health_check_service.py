import logging
from abc import ABC, abstractmethod

from fastapi import status
from src.server_error import Detail, ServerError
from src.services.db_service import DBService

logger = logging.getLogger(__name__)


class IHealthCheckService(ABC):
    @abstractmethod
    def check_health(self) -> bool:
        raise Exception("NotImplementedException")


class HealthCheckService(IHealthCheckService):
    def __init__(self, db_service: DBService):
        self.db_service = db_service

    def check_health(self):
        try:
            return self.db_service.check_database_is_alive()
        except Exception as error:
            message = "An error occurred when checking if application is alive"
            logger.error(message)
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                type(
                    Detail,
                    (object,),
                    {"context": "unknown", "cause": error},
                ),
            )
