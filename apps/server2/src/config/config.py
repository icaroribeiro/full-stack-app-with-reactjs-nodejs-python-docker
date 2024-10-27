import os

from fastapi import status

from src.server_error import ServerError


class Config:
    @property
    def port(self) -> str:
        return self.__get_env_var(name="PORT")

    # @property
    # def database_driver(self) -> str:
    #     return self.get(key="DATABASE_DRIVER", default_value="postgresql+asyncpg")

    # @property
    # def database_user(self) -> str:
    #     return self.get(key="DATABASE_USER", default_value="root")

    # @property
    # def database_password(self) -> str:
    #     return self.get(key="DATABASE_PASSWORD", default_value="root")

    # @property
    # def database_host(self) -> str:
    #     return self.get(key="DATABASE_HOST", default_value="localhost")

    # @property
    # def database_port(self) -> str:
    #     return self.get(key="DATABASE_PORT", default_value="5433")

    # @property
    # def database_name(self) -> str:
    #     return self.get(key="DATABASE_NAME", default_value="db")

    # @property
    # def database_url(self) -> str:
    #     return self.get(
    #         key="DATABASE_URL",
    #         default_value="postgresql+asyncpg://root:root@localhost:5433/db",
    #     )

    @staticmethod
    def __get_env_var(name: str) -> str:
        if os.environ.get(name) is None:
            message = f"{name} environment variable isn't set"
            raise ServerError(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
        return os.environ.get(name)
