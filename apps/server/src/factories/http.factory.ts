import { createServer, Server as HttpServer } from 'http'

import { Server } from '../api/server'
import { config } from '../config/config'
import { AppContainer } from '../containers'
import { AbsTestFactory } from './abs.factory'

class HttpTestFactory extends AbsTestFactory {
  private readonly server: Server = new Server()
  private readonly http: HttpServer = createServer(this.server.app)

  public async prepareAll(): Promise<void> {
    await this.initializeDatabase()
    try {
      new AppContainer()
      const port = parseInt(config.getPort())
      this.http.listen(port)
    } catch (err) {
      console.error('Server starting failed!', err)
    }
  }

  public async closeEach(): Promise<void> {
    await this.clearDatabase()
    try {
      this.http.close()
    } catch (err) {
      console.error('Server closure failed!', err)
    }
  }

  public async closeAll(): Promise<void> {
    await this.disableDatabase()
  }
}

export { HttpTestFactory }
