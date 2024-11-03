import logging

from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends
from src.api.components.health.health_check_mapper import HealthCheckMapper
from src.api.components.health.health_check_service import HealthCheckService
from src.services.container_service import Container

logger = logging.getLogger(__name__)


class HealthCheckController(APIRouter):
    def __init__(
        self,
        prefix="/health",
        dependencies=[Depends(Provide[Container.health_check_service])],
    ):
        super().__init__(prefix=prefix, dependencies=dependencies)

        @self.api_route(
            path="",
            methods=["GET"],
            tags=["health-check"],
            description="API endpoint used to verify if the service has started up correctly and is ready to accept requests",  # noqa: E501
        )
        @inject
        async def get_health(
            health_check_service: HealthCheckService = self.dependencies[0],
        ):
            is_healthy = health_check_service.check_health()
            health_check_response = HealthCheckMapper.to_response(is_healthy)
            return health_check_response
