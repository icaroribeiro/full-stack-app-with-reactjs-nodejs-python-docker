import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import status
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    create_async_engine,
)

from src.server_error import Detail, ServerError

logger = logging.getLogger(__name__)


class DBService:
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
            async with self.__engine.begin() as conn:
                try:
                    await conn.execute("SELECT 1")
                    return True
                except Exception as error:
                    await conn.rollback()
                    message = "Async transaction not established!"
                    logger.error(message, error)
                    raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
        message = "Async engine is None!"
        logger.error(message)
        raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

    # async def close(self):
    #     if self.__engine is None:
    #         raise Exception("DatabaseSessionManager is not initialized")

    #     await self.__engine.dispose()

    #     self.__engine = None
    #     self.__sessionmaker = None

    # @asynccontextmanager
    # async def session(self) -> AsyncIterator[AsyncSession]:
    #     if self.__sessionmaker is None:
    #         raise Exception("DatabaseSessionManager is not initialized")

    #     async with self.__sessionmaker() as session:
    #         try:
    #             yield session
    #         except Exception:
    #             await session.rollback()
    #             raise
    #         finally:
    #             await session.close()
