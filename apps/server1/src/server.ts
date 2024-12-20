import cors from 'cors'
import express, { Application, json, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'

import swaggerDocument from '../api/swagger.json'
import { RegisterRoutes } from './api/routes/routes'
import { APIErrorHandler } from './api/utils/api-error-handler'
import { Config } from './config/config'
import { Container } from './container/container'
import { DBService } from './services'

class Server {
  private readonly _app: Application = express()

  constructor(config: Config) {
    const container = new Container()
    const dbService = container.container.resolve<DBService>('DBService')
    dbService.connectDatabase(config.getDatabaseURL())
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
    const allowedOrigins = config.getAllowedOrigins().split(',')
    const options: cors.CorsOptions = {
      origin: allowedOrigins,
    }
    this._app.use(cors(options))
    this._app.use(json())
    RegisterRoutes(this._app)
    const apiErrorHandler = new APIErrorHandler()
    this._app.use(apiErrorHandler.handleError)
  }

  public get app(): express.Application {
    return this._app
  }
}

export { Server }
