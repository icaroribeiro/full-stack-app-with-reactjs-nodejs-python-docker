import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { INTERNAL_SERVER_ERROR } from 'http-status'
import postgres from 'postgres'

import { ServerError } from '../api/server.error'

class DB {
  public connect(
    databaseURL: string,
  ): PostgresJsDatabase<Record<string, never>> {
    try {
      const client = postgres(databaseURL)
      const db = drizzle(client)
      console.log('Database connected successfully!')
      return db
    } catch (error) {
      const message = 'Database connection failed!'
      console.error(message, error)
      throw new ServerError(message, INTERNAL_SERVER_ERROR)
    }
  }
}

const db = new DB()
export { db }
