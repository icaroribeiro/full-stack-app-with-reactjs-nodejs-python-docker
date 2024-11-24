from typing import Annotated

from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from api.components.user.user_mapper import UserMapper
from api.components.user.user_models import UserRequest, UserResponse
from api.components.user.user_service import UserService
from api.shared.api_error_response import APIErrorResponse
from container.container import Container
from services.api_pagination_service import APIPaginationData, APIPaginationService


class UserController(APIRouter):
    def __init__(
        self,
        prefix="/users",
        dependencies=[
            Depends(Provide[Container.user_service_provider]),
            Depends(Provide[Container.api_pagination_service_provider]),
        ],
    ):
        super().__init__(prefix=prefix, dependencies=dependencies)
        self.setup_routes()

    def setup_routes(self):
        @APIRouter.api_route(
            self,
            path="",
            methods=["POST"],
            tags=["users"],
            description="API endpoint used to create a new user",
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
                                "created_at": "XXXX-XX-XXTXX:XX:XX.XXXXXX",
                                "updated_at": "",
                            }
                        }
                    },
                },
                status.HTTP_422_UNPROCESSABLE_ENTITY: {
                    "model": APIErrorResponse,
                    "description": "Unprocessable Entity",
                    "content": {
                        "application/json": {
                            "example": {
                                "message": "",
                                "details": {"context": "", "cause": ""},
                                "isOperational": True,
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
            user_request: UserRequest,
            user_service: UserService = self.dependencies[0],
        ) -> JSONResponse:
            domain_user = UserMapper.to_domain(user_request)
            returned_user = await user_service.register_user(domain_user)
            user_response = UserMapper.to_response(returned_user)
            response = JSONResponse(
                content=jsonable_encoder(user_response),
                status_code=status.HTTP_201_CREATED,
            )
            return response

        @APIRouter.api_route(
            self,
            path="",
            methods=["GET"],
            tags=["users"],
            description="""
            API endpoint used to get users through page-based pagination schema.
            * @param page The number of the page. If isn't provided, it will be set to 1.
            * @param limit The number of records per page. If isn't provided, it will be set to 1.
            """,
            responses={
                status.HTTP_200_OK: {
                    "model": UserResponse,
                    "description": "OK",
                    "content": {
                        "application/json": {
                            "example": {
                                "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
                                "name": "name",
                                "email": "email@email.com",
                                "created_at": "XXXX-XX-XXTXX:XX:XX.XXXXXX",
                                "updated_at": "",
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
        async def fetch_paginated_users(
            request: Request,
            page: Annotated[int | None, Query()] = 1,
            limit: Annotated[int | None, Query()] = 1,
            user_service: UserService = self.dependencies[0],
            api_pagination_service: APIPaginationService = self.dependencies[1],
        ) -> JSONResponse:
            base_url = str(request.url)
            (returned_users, count) = await user_service.retrieve_and_count_users(
                page, limit
            )
            api_pagination_data = APIPaginationData(
                page=page, limit=limit, total_records=count, records=returned_users
            )
            api_pagination_response = (
                api_pagination_service.create_api_pagination_response(
                    base_url, api_pagination_data
                )
            )
            response = JSONResponse(
                content=jsonable_encoder(api_pagination_response),
                status_code=status.HTTP_200_OK,
            )
            return response

        @APIRouter.api_route(
            self,
            path="/{user_id}",
            methods=["GET"],
            tags=["users"],
            description="API endpoint used to get a user by its ID",
            responses={
                status.HTTP_200_OK: {
                    "model": UserResponse,
                    "description": "OK",
                    "content": {
                        "application/json": {
                            "example": {
                                "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
                                "name": "name",
                                "email": "email@email.com",
                                "created_at": "XXXX-XX-XXTXX:XX:XX.XXXXXX",
                                "updated_at": "",
                            }
                        }
                    },
                },
                status.HTTP_404_NOT_FOUND: {
                    "model": APIErrorResponse,
                    "description": "Unprocessable Entity",
                    "content": {
                        "application/json": {
                            "example": {
                                "message": "",
                                "details": {"context": "", "cause": ""},
                                "isOperational": True,
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
        async def fetch_user(
            user_id: str,
            user_service: UserService = self.dependencies[0],
        ) -> JSONResponse:
            returned_user = await user_service.retrieve_user(user_id)
            user_response = UserMapper.to_response(returned_user)
            response = JSONResponse(
                content=jsonable_encoder(user_response),
                status_code=status.HTTP_200_OK,
            )
            return response

        @APIRouter.api_route(
            self,
            path="/{user_id}",
            methods=["PUT"],
            tags=["users"],
            description="API endpoint used to update a user by its ID",
            responses={
                status.HTTP_200_OK: {
                    "model": UserResponse,
                    "description": "OK",
                    "content": {
                        "application/json": {
                            "example": {
                                "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
                                "name": "name",
                                "email": "email@email.com",
                                "created_at": "XXXX-XX-XXTXX:XX:XX.XXXXXX",
                                "updated_at": "",
                            }
                        }
                    },
                },
                status.HTTP_404_NOT_FOUND: {
                    "model": APIErrorResponse,
                    "description": "Not Found",
                    "content": {
                        "application/json": {
                            "example": {
                                "message": "",
                                "details": {"context": "", "cause": ""},
                                "isOperational": True,
                            }
                        }
                    },
                },
                status.HTTP_422_UNPROCESSABLE_ENTITY: {
                    "model": APIErrorResponse,
                    "description": "Unprocessable Entity",
                    "content": {
                        "application/json": {
                            "example": {
                                "message": "",
                                "details": {"context": "", "cause": ""},
                                "isOperational": True,
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
        async def renew_user(
            user_id: str,
            user_request: UserRequest,
            user_service: UserService = self.dependencies[0],
        ) -> JSONResponse:
            domain_user = UserMapper.to_domain(user_request)
            returned_user = await user_service.replace_user(user_id, domain_user)
            user_response = UserMapper.to_response(returned_user)
            response = JSONResponse(
                content=jsonable_encoder(user_response),
                status_code=status.HTTP_200_OK,
            )
            return response

        @APIRouter.api_route(
            self,
            path="/{user_id}",
            methods=["DELETE"],
            tags=["users"],
            description="API endpoint used to delete a user by its ID",
            responses={
                status.HTTP_200_OK: {
                    "model": UserResponse,
                    "description": "OK",
                    "content": {
                        "application/json": {
                            "example": {
                                "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
                                "name": "name",
                                "email": "email@email.com",
                                "created_at": "XXXX-XX-XXTXX:XX:XX.XXXXXX",
                                "updated_at": "",
                            }
                        }
                    },
                },
                status.HTTP_404_NOT_FOUND: {
                    "model": APIErrorResponse,
                    "description": "Not Found",
                    "content": {
                        "application/json": {
                            "example": {
                                "message": "",
                                "details": {"context": "", "cause": ""},
                                "isOperational": True,
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
        async def destroy_user(
            user_id: str,
            user_service: UserService = self.dependencies[0],
        ) -> JSONResponse:
            returned_user = await user_service.remove_user(user_id)
            user_response = UserMapper.to_response(returned_user)
            response = JSONResponse(
                content=jsonable_encoder(user_response),
                status_code=status.HTTP_200_OK,
            )
            return response
