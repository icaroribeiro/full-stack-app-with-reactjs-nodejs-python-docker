import 'reflect-metadata'

import { createServer, Server as HttpServer } from 'http'

import { Config } from './config/config'
import { Server } from './server'

try {
  const config = new Config()
  const server: Server = new Server(config)
  const httpServer: HttpServer = createServer(server.app)
  const port = parseInt(config.getPort())
  httpServer.listen(port, () => {
    console.log('Server started successfully!')
  })
  httpServer.on('close', () => {
    console.log('Server closed successfully!')
  })
} catch (error) {
  console.error('Server starting failed!', error)
}
