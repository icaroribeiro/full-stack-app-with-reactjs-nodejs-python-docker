import cors from 'cors'
import express, { Application, json, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'

import swaggerDocument from '../api/swagger.json'
import { errorMiddleware } from './api/middlewares'
import { RegisterRoutes } from './api/routes/routes'
import { config } from './config/config'

class Server {
  private readonly _app: Application = express()

  constructor() {
    this.registerMiddleware()
    this.registerRoutes()
    this.registerErrorHandler()
  }

  public get app(): express.Application {
    return this._app
  }

  private registerMiddleware() {
    const allowedOrigins = config.getAllowedOrigins().split(',')
    const options: cors.CorsOptions = {
      origin: allowedOrigins,
    }
    this._app.use(cors(options))
    this._app.use(json())
  }

  private registerRoutes() {
    const swaggerUiOpts = {
      swaggerUrl: '/api-docs/swagger.json',
    }
    this._app.get('/api-docs/swagger.json', (req: Request, res: Response) =>
      res.json(swaggerDocument),
    )
    this._app.use(
      '/api-docs',
      swaggerUi.serveFiles(undefined, swaggerUiOpts),
      swaggerUi.setup(undefined, swaggerUiOpts),
    )
    RegisterRoutes(this._app)
  }

  private registerErrorHandler() {
    this._app.use(errorMiddleware)
  }
}

export { Server }
