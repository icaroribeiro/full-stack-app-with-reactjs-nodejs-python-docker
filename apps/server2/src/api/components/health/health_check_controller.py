import logging

from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends
from src.api.components.health.health_check_mapper import HealthCheckMapper
from src.api.components.health.health_check_service import HealthCheckService
from src.services.container_service import ContainerService

logger = logging.getLogger(__name__)


class HealthCheckController(APIRouter):
    @inject
    def __init__(
        self,
        prefix="/health",
        tags=["health"],
        dependencies=[
            Depends(Provide[ContainerService().container.health_check_service])
        ],
    ):
        super().__init__()

        @self.get(path="/status")
        def get_health():
            health_check_service: HealthCheckService = self.dependencies[0]
            is_healthy = health_check_service.check_health()
            health_check_response = HealthCheckMapper.to_response(is_healthy)
            return health_check_response
