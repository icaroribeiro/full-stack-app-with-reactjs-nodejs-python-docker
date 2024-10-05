import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { INTERNAL_SERVER_ERROR } from 'http-status'
import postgres from 'postgres'

import { AppError } from '../app-error'
import { config } from '../config/config'

class DB {
  public connect(): PostgresJsDatabase<Record<string, never>> {
    try {
      const client = postgres(config.getDatabaseURL())
      const db = drizzle(client)
      console.log('Database connected successfully!')
      return db
    } catch (error) {
      const message = 'Database connection failed!'
      console.error(message, error)
      throw new AppError(message, INTERNAL_SERVER_ERROR)
    }
  }
}

const db = new DB()
export { db }
