import asyncio

import pytest
from dotenv import load_dotenv
from src.config.config import config
from src.services.db_service import DBService
from testcontainers.postgres import DbContainer, PostgresContainer


@pytest.fixture(scope="session", autouse=True)
def load_env_vars() -> None:
    load_dotenv(".env.test")
    # print("Environment variables loaded successfully!")


@pytest.fixture(scope="session", autouse=True)
def start_database_container(request) -> DbContainer:
    db_user = config.get_database_username()
    db_password = config.get_database_password()
    db_name = config.get_database_name()
    container = PostgresContainer(
        image="postgres:latest",
        username=db_user,
        password=db_password,
        dbname=db_name,
        driver="asyncpg",
    ).start()
    db_url = container.get_connection_url()
    config.set_database_url(db_url)

    def stop_database_container() -> None:
        container.stop()
        # print("Database container stopped successfully!")

    request.addfinalizer(stop_database_container)
    # print("Database container started successfully!")
    return container


@pytest.fixture(scope="class")
def db_service() -> DBService:
    return DBService()


@pytest.fixture(scope="class")
async def initialize_database(request, db_service: DBService) -> None:
    db_service.connect_database(config.get_database_url())
    alembic_file_path = "alembic.ini"
    await db_service.migrate_database(alembic_file_path)

    def finalize():
        async def deactivate_database() -> None:
            await db_service.delete_database_tables()
            # print("Database tables deleted successfully!")
            await db_service.deactivate_database()
            # print("Database deactivated successfully!")

        asyncio.get_event_loop().run_until_complete(deactivate_database())

    request.addfinalizer(finalize)
    print("Database initialized successfully!")


@pytest.fixture(scope="function")
async def clear_database_tables(db_service: DBService) -> None:
    await db_service.clear_database_tables()
    # print("Database tables cleaned successfully!")
