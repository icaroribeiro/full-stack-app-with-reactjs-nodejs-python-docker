import { createServer, Server as HttpServer } from 'http'

import { Server } from '../server'
import { config } from '../config/config'
import { ContainerService } from '../services/container-service'
import { AbsTestFactory } from './abs-factory'

class HttpTestFactory extends AbsTestFactory {
  private readonly server: Server = new Server()
  private readonly http: HttpServer = createServer(this.server.app)

  public async prepareAll(): Promise<void> {
    await this.setupDatabaseContainer()
    await this.initializeDatabase()
    try {
      new ContainerService()
      const port = parseInt(config.getPort())
      this.http.listen(port)
    } catch (err) {
      console.error('Server starting failed!', err)
    }
  }

  public async closeEach(): Promise<void> {
    await this.clearDatabaseTables()
  }

  public async closeAll(): Promise<void> {
    await this.deactivateDatabase()
    try {
      this.http.close()
    } catch (err) {
      console.error('Server closure failed!', err)
    }
  }
}

export { HttpTestFactory }
