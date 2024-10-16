import { sql } from 'drizzle-orm'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
// import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { INTERNAL_SERVER_ERROR } from 'http-status'
import postgres from 'postgres'

import { ServerError } from '../api/server-error'

interface IDBService {
  connectDatabase(databaseURL: string): void
  isDatabaseAlive(): boolean
  migrateDatabase(databaseURL: string, migrationsFolder: string): Promise<void>
}

class DBService implements IDBService {
  private _client?: postgres.Sql
  private _db?: PostgresJsDatabase<Record<string, never>>

  constructor() {}

  public get client(): postgres.Sql {
    if (this._client !== undefined) {
      return this._client
    }
    throw new Error('client is undefined!')
  }

  public get db(): PostgresJsDatabase<Record<string, never>> {
    if (this._db !== undefined) {
      return this._db
    }
    throw new Error('db is undefined!')
  }

  public connectDatabase(databaseURL: string): void {
    try {
      this._client = postgres(databaseURL)
      this._db = drizzle(this._client)
      if (this._client !== undefined && this._db !== undefined) {
        console.log('Database connected successfully!')
        return
      }
    } catch (error) {
      const message = 'Database connection failed!'
      console.error(message, error)
      throw new ServerError(message, INTERNAL_SERVER_ERROR)
    }
  }

  public isDatabaseAlive(): boolean {
    if (this._db !== undefined) {
      this._db.execute(sql`SELECT 1`)
      return true
    }
    return false
  }

  public async migrateDatabase(databaseURL: string, migrationsFolder: string) {
    let migrationClient
    try {
      migrationClient = postgres(databaseURL, { max: 1 })
      console.log('Migration client created successfully!')
    } catch (error) {
      console.error(error)
      const message = 'Migration client creation failed!'
      throw new Error(message)
    }
    try {
      await migrate(drizzle(migrationClient), {
        migrationsFolder: migrationsFolder,
      })
      console.log('Migrations completed successfully!')
      await migrationClient.end()
    } catch (error) {
      console.error(error)
      const message = 'Migrations failed!'
      throw new Error(message)
    }
  }
}

export { DBService, IDBService }
