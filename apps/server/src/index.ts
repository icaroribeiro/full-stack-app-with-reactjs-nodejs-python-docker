import 'reflect-metadata'

import { Application } from 'express'
import { createServer, Server as HttpServer } from 'http'

import App from './app/app'
import { config } from './app/config/config'

const run = (): void => {
  try {
    const app: Application = new App().innerApp
    const server: HttpServer = createServer(app)
    const port = parseInt(config.getPort())
    server.listen(port, () => {
      console.log('Server started successfully!')
    })
    server.on('close', () => {
      console.log('Server closed successfully!')
    })
  } catch (err) {
    console.error('Server start failed!', err)
  }
}

run()
