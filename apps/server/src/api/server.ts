import express, { Application, json, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'

import swaggerDocument from '../../api/swagger.json'
import { errorMiddleware } from './middlewares'
import { RegisterRoutes } from './routes/routes'

class Server {
  private readonly _app: Application = express()

  public constructor() {
    this._app.use(json())
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
    this._app.use(errorMiddleware)
  }

  public get app(): express.Application {
    return this._app
  }
}

export { Server }
