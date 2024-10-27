from fastapi import FastAPI


class Server:
    __app: FastAPI = FastAPI()

    def __init__(self):
        self.register_routes()

    @property
    def app(self) -> FastAPI:
        return self.__app

    def register_routes(self) -> None:
        return
