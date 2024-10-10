import { createServer, Server as HttpServer } from 'http'

import { Server } from '../api/server'
import { config } from '../config/config'
import { AbsTestFactory } from './abs.factory'

class HttpTestFactory extends AbsTestFactory {
  // private readonly server: Server = new Server()
  // private readonly http: HttpServer = createServer(this.server.app)

  public async prepareAll(): Promise<void> {
    await this.setup()
    // try {
    //   const port = parseInt(config.getPort())
    //   this.http.listen(port)
    // } catch (err) {
    //   console.error('Server start failed!', err)
    // }
  }

  public async closeEach(): Promise<void> {
    await this.release()
  }

  public async closeAll(): Promise<void> {
    await this.teardown()
    // try {
    //   this.http.on('close', () => {
    //     console.log('Server closed successfully!')
    //   })
    // } catch (err) {
    //   console.error('Server close failed!', err)
    // }
  }
}

export { HttpTestFactory }
