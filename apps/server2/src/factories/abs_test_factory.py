from abc import ABC, abstractmethod

from testcontainers.postgres import DbContainer, PostgresContainer

from src.config import config
from src.services.db_service import DBService


class ITestFactory(ABC):
    @abstractmethod
    async def prepare_all(self) -> None:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def close_each(self) -> None:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def close_all(self) -> None:
        raise Exception("NotImplementedException")


class AbsTestFactory(ITestFactory):
    __db_container: DbContainer | None
    __db_service: DBService

    def __init__(self):
        self.__db_container = None
        self.__db_service = DBService()

    @property
    def db_service(self) -> DBService:
        return self.__db_service

    async def setup_database_container(self) -> None:
        try:
            db_user = config.get_database_username()
            db_password = config.get_database_password()
            db_name = config.get_database_name()
            container = PostgresContainer(
                image="postgres:latest",
                username=db_user,
                password=db_password,
                dbname=db_name,
            ).start()
            db_url = container.get_connection_url()
            config.set_database_url(db_url)
            self.__db_container = container
            print("Database container setted up successfully!")
        except Exception as error:
            message = "Database container setup failed!"
            print(message, error)
            raise

    async def initialize_database(self) -> None:
        try:
            self.__db_service.connect_database(config.get_database_url())
            alembic_file_path = "alembic.ini"
            self.__db_service.migrate_database(alembic_file_path)
            print("Database initialized successfully!")
        except Exception as error:
            message = "Database initialization failed!"
            print(message, error)
            raise

    async def clear_database_tables(self) -> None:
        try:
            await self.__db_service.clear_database_tables()
            print("Database cleaned successfully!")
        except Exception as error:
            message = "Database cleaning failed!"
            print(message, error)
            raise error

    async def deactivate_database_container(self) -> None:
        try:
            if self.__db_container is not None:
                await self.__db_container.stop()
                print("Database container deactivated successfully!")
                return
            message = "Database container is None!"
            raise Exception(message)
        except Exception as error:
            message = "Database container deactivation failed!"
            print(message, error)
            raise error

    async def deactivate_database(self) -> None:
        try:
            await self.__db_service.deactivate_database()
            print("Database deactivated successfully!")
        except Exception as error:
            message = "Database container deactivation failed!"
            print(message, error)
            raise error
