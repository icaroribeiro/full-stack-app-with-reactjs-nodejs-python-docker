import { sql } from 'drizzle-orm'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { INTERNAL_SERVER_ERROR } from 'http-status'
import postgres from 'postgres'

import { ServerError } from '../api/server-error'

interface IDBService {
  connectDatabase(databaseURL: string): void
  checkDatabaseIsAlive(): boolean
  migrateDatabase(migrationsFolder: string): Promise<void>
  getDatabaseTableRowCount(name: string): Promise<number>
  clearDatabaseTables(): Promise<void>
}

class DBService implements IDBService {
  private _dbClient?: postgres.Sql
  private _db?: PostgresJsDatabase<Record<string, never>>
  private dbMigrationClient?: postgres.Sql

  constructor() {
    this._dbClient = undefined
    this._db = undefined
    this.dbMigrationClient = undefined
  }

  public get dbClient(): postgres.Sql {
    if (this._dbClient !== undefined) {
      return this._dbClient
    }
    const message = 'Database client is undefined!'
    console.error(message)
    throw new ServerError(message, INTERNAL_SERVER_ERROR)
  }

  public get db(): PostgresJsDatabase<Record<string, never>> {
    if (this._db !== undefined) {
      return this._db
    }
    const message = 'DB is undefined!'
    console.error(message)
    throw new ServerError(message, INTERNAL_SERVER_ERROR)
  }

  public connectDatabase(databaseURL: string): void {
    try {
      this._dbClient = postgres(databaseURL)
      console.log('Database client created successfully!')
      this.dbMigrationClient = postgres(databaseURL, { max: 1 })
      console.log('Database migration client created successfully!')
      this._db = drizzle(this._dbClient)
      console.log('Database connected successfully!')
    } catch (error) {
      const message = 'Database connection failed!'
      console.error(message, error)
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: databaseURL,
        cause: error,
      })
    }
  }

  public checkDatabaseIsAlive(): boolean {
    if (this._db !== undefined) {
      this._db.execute(sql`SELECT 1`)
      return true
    }
    const message = 'DB is undefined!'
    console.error(message)
    throw new ServerError(message, INTERNAL_SERVER_ERROR)
  }

  public async migrateDatabase(migrationsFolder: string): Promise<void> {
    if (this.dbMigrationClient !== undefined) {
      try {
        await migrate(drizzle(this.dbMigrationClient), {
          migrationsFolder: migrationsFolder,
        })
        console.log('Database migrations completed successfully!')
        await this.dbMigrationClient.end()
        return
      } catch (error) {
        const message = 'Database migrations failed!'
        console.error(message, error)
        throw new ServerError(message, INTERNAL_SERVER_ERROR)
      }
    }
    const message = 'Database migration client is undefined!'
    console.error(message)
    throw new ServerError(message, INTERNAL_SERVER_ERROR)
  }

  public async getDatabaseTableRowCount(name: string): Promise<number> {
    if (this._db !== undefined) {
      const query = sql.raw(`
        SELECT count(*) 
        FROM ${name};
      `)
      const result = await this._db.execute(query)
      return result.length ? parseInt(result[0].count as string) : 0
    }
    const message = 'DB is undefined!'
    console.error(message)
    throw new ServerError(message, INTERNAL_SERVER_ERROR)
  }

  public async clearDatabaseTables(): Promise<void> {
    if (this._db !== undefined) {
      const query = sql<string>`
				SELECT table_name
				FROM information_schema.tables
					WHERE table_schema = 'public'
						AND table_type = 'BASE TABLE';
			`
      const tables = await this._db.execute(query)
      for (const table of tables) {
        const query = sql.raw(`
          TRUNCATE TABLE ${table.table_name} CASCADE;
        `)
        await this._db.execute(query)
      }
      return
    }
    const message = 'DB is undefined!'
    console.error(message)
    throw new ServerError(message, INTERNAL_SERVER_ERROR)
  }
}

export { DBService, IDBService }
