import { INTERNAL_SERVER_ERROR } from 'http-status'

import { DBService } from '../../../services'
import { ServerError } from '../../server-error'

interface IHealthCheckService {
  checkHealth(): boolean
}

class HealthCheckService implements IHealthCheckService {
  constructor(private dbService: DBService) {}

  checkHealth(): boolean {
    try {
      return this.dbService.isDatabaseAlive()
    } catch (error) {
      const message = 'An error occurred when checking if application is alive'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: 'unknown',
        cause: error,
      })
    }
  }
}

export { HealthCheckService, IHealthCheckService }
