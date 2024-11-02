class ContainerService:
  _container: containers.DeclarativeContainer
 
  def __init__():
    self.register_database_container()
    self.register_repository_container()
    self.register_service_container()

      @property
    def app(self) -> FastAPI:
        return self.__app