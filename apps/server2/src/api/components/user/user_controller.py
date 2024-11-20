from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from src.api.components.user.user_mapper import UserMapper
from src.api.components.user.user_models import UserRequest, UserResponse
from src.api.components.user.user_service import UserService
from src.api.shared.api_error_response import APIErrorResponse
from src.container.container import Container


class UserController(APIRouter):
    def __init__(
        self,
        prefix="/users",
        dependencies=[Depends(Provide[Container.user_service_provider])],
    ):
        super().__init__(prefix=prefix, dependencies=dependencies)
        self.setup_routes()

    def setup_routes(self):
        @APIRouter.api_route(
            self,
            path="",
            methods=["POST"],
            tags=["users"],
            description="API endpoint used to create a new user.",
            responses={
                status.HTTP_201_CREATED: {
                    "model": UserResponse,
                    "description": "Created",
                    "content": {
                        "application/json": {
                            "example": {
                                "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
                                "name": "name",
                                "email": "email@email.com",
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
        async def add_user(
            body: UserRequest,
            user_service: UserService = self.dependencies[0],
        ) -> JSONResponse:
            user = UserMapper.to_domain(body)
            registered_user = await user_service.register_user(user)
            user_response = UserMapper.to_response(registered_user)
            response = JSONResponse(
                content=user_response.model_dump(),
                status_code=status.HTTP_201_CREATED,
            )
            return response
