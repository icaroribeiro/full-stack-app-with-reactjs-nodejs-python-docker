import logging
from abc import ABC, abstractmethod
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    create_async_engine,
)

from src.server_error import Detail, ServerError

logger = logging.getLogger(__name__)


class IDBService(ABC):
    @abstractmethod
    async def connect_database(self, databaseURL: str) -> None:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def check_database_is_alive(self) -> bool:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def clear_database_tables(self) -> None:
        raise Exception("NotImplementedException")

    @abstractmethod
    async def deactivate_database(self) -> None:
        raise Exception("NotImplementedException")


class DBService(IDBService):
    __engine: AsyncEngine

    def __init__(self):
        self.__engine = None
        # self.__sessionmaker = async_sessionmaker(autocommit=False, bind=self.__engine)

    @asynccontextmanager
    @property
    async def conn(self) -> AsyncIterator[AsyncConnection]:
        if self.__engine is not None:
            async with self.__engine.begin() as conn:
                try:
                    yield conn
                except Exception as error:
                    await conn.rollback()
                    message = "Async transaction not established!"
                    logger.error(message, error)
                    raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
        message = "Async engine is None!"
        logger.error(message)
        raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def connect_database(self, databaseURL: str) -> None:
        try:
            self.__engine = create_async_engine(url=databaseURL)
            logger.info("Async engine created successfully!")
        except Exception as error:
            message = "Database connection failed!"
            logger.error(message, error)
            # obj = Detail()
            # obj.context = databaseURL
            # obj.cause = error
            raise ServerError(
                message,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                type(
                    Detail,
                    (object,),
                    {"context": databaseURL, "cause": error},
                ),
            )

    async def check_database_is_alive(self) -> bool:
        if self.__engine is not None:
            async with self.__engine.connect() as conn:
                try:
                    await conn.execute(text("SELECT 1"))
                    await conn.commit()
                    return True
                except Exception as error:
                    await conn.rollback()
                    message = "Async transaction not established!"
                    logger.error(message, error)
                    raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
        message = "Async engine is None!"
        logger.error(message)
        raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

    async def clear_database_tables(self) -> None:
        if self.__engine is not None:
            async with self.__engine.connect() as conn:
                try:
                    query = text(
                        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
                    )
                    tables2 = await conn.execute(query)
                    for table in tables2.fetchall():
                        print("Table=", table[0])
                    # tables = await conn.run_sync(
                    #     lambda sync_conn: inspect(sync_conn).get_table_names()
                    # )
                    for table in tables:
                        query = text(f"TRUNCATE TABLE {table} CASCADE;")
                        await conn.execute(query)
                    await conn.commit()
                    return
                except Exception as error:
                    await conn.rollback()
                    message = "Async transaction not established!"
                    logger.error(message, error)
                    raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
        message = "Async engine is None!"
        logger.error(message)
        raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

    async def deactivate_database(self) -> None:
        if self.__engine is not None:
            await self.__engine.dispose()
        message = "Async engine is None!"
        logger.error(message)
        raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
