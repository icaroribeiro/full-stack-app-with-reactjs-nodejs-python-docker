import { sql } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { INTERNAL_SERVER_ERROR } from 'http-status'

import { ServerError } from '../../server.error'

interface IHealthCheckService {
  checkHealth(): boolean
}

class HealthCheckService implements IHealthCheckService {
  constructor(private db: PostgresJsDatabase<Record<string, never>>) {}

  checkHealth(): boolean {
    try {
      this.db.execute(sql`SELECT 1`)
      return true
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
