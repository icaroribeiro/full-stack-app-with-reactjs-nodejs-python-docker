import logging

from fastapi import FastAPI

from src.api.components.health import health_check_controller
from src.api.routers.routers import health_check_router
from src.config import config
from src.container.container import Container

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


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
        container = Container()
        db_service = container.db_service_provider()
        db_service.connect_database(config.get_database_url())
        container.wire(modules=[health_check_controller])
        self.__app.include_router(router=health_check_router)
