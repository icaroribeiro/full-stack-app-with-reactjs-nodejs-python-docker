import httpStatus from 'http-status'

import { ServerError } from '../../../server-error'
import { DBService } from '../../../services'

interface IHealthCheckService {
  checkHealth(): Promise<boolean | void>
}

class HealthCheckService implements IHealthCheckService {
  constructor(private dbService: DBService) {}

  async checkHealth(): Promise<boolean | void> {
    try {
      return await this.dbService.checkDatabaseIsAlive()
    } catch (error) {
      const message =
        'An error occurred when checking if application is healthy'
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: undefined,
        cause: error,
      })
    }
  }
}

export { HealthCheckService, IHealthCheckService }
