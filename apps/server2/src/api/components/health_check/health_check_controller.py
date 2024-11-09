from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, Response, status
from src.api.components.health_check.health_check_mapper import HealthCheckMapper
from src.api.components.health_check.health_check_models import HealthCheckResponse
from src.api.components.health_check.health_check_service import HealthCheckService
from src.api.shared.api_error_response import APIErrorResponse
from src.container.container import Container


class HealthCheckController(APIRouter):
    def __init__(
        self,
        prefix="/health",
        dependencies=[Depends(Provide[Container.health_check_service_provider])],
    ):
        super().__init__(prefix=prefix, dependencies=dependencies)
        self.setup_routes()

    def setup_routes(self):
        @APIRouter.api_route(
            self,
            path="",
            methods=["GET"],
            tags=["health-check"],
            description="API endpoint used to verify if "
            + "the service has started up correctly and is ready to accept requests",
            responses={
                status.HTTP_200_OK: {
                    "model": HealthCheckResponse,
                    "description": "OK",
                    "content": {
                        "application/json": {
                            "example": {
                                "healthy": True,
                            }
                        }
                    },
                },
                status.HTTP_500_INTERNAL_SERVER_ERROR: {
                    "model": APIErrorResponse,
                    "description": "Internal Server Error",
                    "content": {
                        "application/json": {
                            "example": {
                                "message": "Internal Server Error",
                                "details": {"context": "", "cause": ""},
                                "isOperational": False,
                            }
                        }
                    },
                },
            },
        )
        @inject
        async def get_health(
            response: Response,
            health_check_service: HealthCheckService = self.dependencies[0],
        ) -> HealthCheckResponse:
            is_healthy = await health_check_service.check_health()
            health_check_response = HealthCheckMapper.to_response(is_healthy)
            response.status_code = status.HTTP_200_OK
            return health_check_response
