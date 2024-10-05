import express, { Application, json, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'

import swaggerDocument from '../../api/swagger.json'
import { errorMiddleware } from './api/middlewares'
import { RegisterRoutes } from './api/routes/routes'

class App {
  private readonly _innerApp: Application = express()

  public constructor() {
    this._innerApp.use(json())
    const swaggerUiOpts = {
      swaggerUrl: '/api-docs/swagger.json',
    }
    this._innerApp.get(
      '/api-docs/swagger.json',
      (req: Request, res: Response) => res.json(swaggerDocument),
    )
    this._innerApp.use(
      '/api-docs',
      swaggerUi.serveFiles(undefined, swaggerUiOpts),
      swaggerUi.setup(undefined, swaggerUiOpts),
    )
    RegisterRoutes(this._innerApp)
    this._innerApp.use(errorMiddleware)
  }

  public get innerApp(): express.Application {
    return this._innerApp
  }
}

export default App
