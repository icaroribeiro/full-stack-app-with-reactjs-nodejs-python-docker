import 'reflect-metadata'

import { createServer, Server as HttpServer } from 'http'

import { config } from './config/config'
import { Server } from './server'
import { ContainerService } from './services'

const startServer = (): void => {
  try {
    new ContainerService()
    const server: Server = new Server()
    const http: HttpServer = createServer(server.app)
    const port = parseInt(config.getPort())
    http.listen(port, () => {
      console.log('Server started successfully!')
    })
    http.on('close', () => {
      console.log('Server closed successfully!')
    })
  } catch (error) {
    console.error('Server starting failed!', error)
  }
}

startServer()
