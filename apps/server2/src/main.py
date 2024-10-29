import uvicorn

from src.config import config
from src.server import Server

server = Server()
app = server.app


@app.get("/")
async def main_route():
    return {"message": "Hey, It mfffe Goku"}


is_production_build = True if config.get_env() == "production" else False

if __name__ == "__main__":
    uvicorn.run(
        app=app if is_production_build else "main:app",
        host="0.0.0.0",
        port=int(config.get_port()),
        reload=False if is_production_build else True,
        access_log=False,
    )
