from fastapi import FastAPI

from src.api.components.health import health_check_controller
from src.api.routers.routers import health_check_router
from src.config import config
from src.services.container_service import ContainerService


class Server:
    __app: FastAPI = FastAPI(
        openapi_url=config.get_openapi_url(),
        docs_url=config.get_docs_url(),
        title="Take-Home Assignment API",
        description="A REST API developed using Python and Postgres database\n\nSome useful links:\n- [The REST API repository](https://github.com/icaroribeiro/full-stack-app-with-reactjs-nodejs-python-docker)",  # noqa: E501
        version="1.0.0",
        contact={
            "name": "Ícaro Ribeiro",
            "email": "icaroribeiro@hotmail.com",
            "url": "https://www.linkedin.com/in/icaroribeiro",
        },
        license_info={
            "name": "MIT",
        },
        openapi_tags=[
            {"name": "health-check", "description": "Everything about health check"},
            {"name": "users", "description": "Everything about users"},
        ],
        servers=[
            {"url": "http://localhost:5001", "description": "Development environment"},
            {"url": "http://localhost:5000", "description": "Production environment"},
        ],
    )

    def __init__(self):
        self.register_routes()

    @property
    def app(self) -> FastAPI:
        return self.__app

    def register_routes(self) -> None:
        container_service = ContainerService()
        container_service.initialize_container()
        container_service.container.wire(modules=[health_check_controller])
        self.__app.include_router(router=health_check_router)
