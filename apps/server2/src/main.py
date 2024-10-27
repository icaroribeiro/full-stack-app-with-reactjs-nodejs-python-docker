import uvicorn

from src.server import Server

server = Server()
app = server.app


@app.get("/")
async def main_route():
    return {"message": "Hey, Itkkkk22k iddds mfffe Goku"}


if __name__ == "__main__":
    uvicorn.run(
        app="main:app",
        host="0.0.0.0",
        port=5001,
        reload=True,
        access_log=False,
    )
