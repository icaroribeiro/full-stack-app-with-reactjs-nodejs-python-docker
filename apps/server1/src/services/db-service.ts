import { sql } from 'drizzle-orm'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import httpStatus from 'http-status'
import postgres from 'postgres'

import { ServerError } from '../server-error'

interface IDBService {
  connectDatabase(databaseURL: string): void
  checkDatabaseIsAlive(): Promise<boolean | undefined>
  migrateDatabase(migrationsFolder: string): Promise<void>
  getDatabaseTableRowCount(table_name: string): Promise<number | undefined>
  clearDatabaseTables(): Promise<void>
  deleteDatabaseTables(): Promise<void>
  disconnectDatabase(): Promise<void>
}

class DBService implements IDBService {
  private _dbClient: postgres.Sql | null
  private _db: PostgresJsDatabase<Record<string, never>> | null

  constructor() {
    this._dbClient = null
    this._db = null
  }

  public get db(): PostgresJsDatabase<Record<string, never>> {
    if (this._db) {
      return this._db
    }
    const message = 'Database is null'
    console.error(message)
    throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR)
  }

  public connectDatabase(databaseURL: string): void {
    try {
      this._dbClient = postgres(databaseURL, { max: 1 })
      this._db = drizzle(this._dbClient)
    } catch (err) {
      const message = 'An error occurred when connecting database'
      console.error(message, err)
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: databaseURL,
        cause: err instanceof Error ? err.message : String(err),
      })
    }
  }

  public async checkDatabaseIsAlive(): Promise<boolean | undefined> {
    return await this._db?.transaction(async (tx) => {
      try {
        const query = sql.raw(`
          SELECT 1
        `)
        await tx.execute(query)
        return true
      } catch (err) {
        const message = 'An error occurred when checking database is alive'
        console.error(message, err)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: undefined,
            cause: err instanceof Error ? err.message : String(err),
          })
        }
      }
    })
  }

  public async migrateDatabase(migrationsFolder: string): Promise<void> {
    try {
      await migrate(this._db!, {
        migrationsFolder: migrationsFolder,
      })
    } catch (err) {
      const message = 'An error occurred when migrating the database'
      console.error(message, err)
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: migrationsFolder,
        cause: err instanceof Error ? err.message : String(err),
      })
    }
  }

  public async getDatabaseTableRowCount(
    tableName: string,
  ): Promise<number | undefined> {
    return await this._db?.transaction(async (tx) => {
      try {
        const query = sql.raw(`
            SELECT count(*) 
            FROM ${tableName};
          `)
        const result = await tx.execute(query)
        return result.length ? parseInt(result[0].count as string) : 0
      } catch (err) {
        const message = `An error occurred when counting rows of database table ${tableName}`
        console.error(message, err)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: tableName,
            cause: err instanceof Error ? err.message : String(err),
          })
        }
      }
    })
  }

  public async clearDatabaseTables(): Promise<void> {
    return await this._db?.transaction(async (tx) => {
      try {
        const query = sql.raw(`
            SELECT table_name
            FROM information_schema.tables
              WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE';
          `)
        const tables = await tx.execute(query)
        for (const table of tables) {
          const query = sql.raw(`
              TRUNCATE TABLE ${table.table_name} CASCADE;
            `)
          await tx.execute(query)
        }
      } catch (err) {
        const message = 'An error occurred when cleaning the database tables'
        console.error(message, err)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: undefined,
            cause: err instanceof Error ? err.message : String(err),
          })
        }
      }
    })
  }

  public async deleteDatabaseTables(): Promise<void> {
    return await this._db?.transaction(async (tx) => {
      try {
        let query = sql.raw(`
              DROP SCHEMA IF EXISTS drizzle CASCADE;
            `)
        await tx.execute(query)
        query = sql.raw(`
              SELECT table_name
              FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_type = 'BASE TABLE';
            `)
        const tables = await tx.execute(query)
        for (const table of tables) {
          query = sql.raw(`
                DROP TABLE IF EXISTS ${table.table_name} CASCADE;
              `)
          await tx.execute(query)
        }
      } catch (err) {
        const message = 'An error occurred when deleting the database tables'
        console.error(message, err)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: undefined,
            cause: err instanceof Error ? err.message : String(err),
          })
        }
      }
    })
  }

  public async disconnectDatabase(): Promise<void> {
    try {
      await this._dbClient?.end()
    } catch (err) {
      const message = 'An error occurred when disconnecting the database'
      console.error(message, err)
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: undefined,
        cause: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

export { DBService, IDBService }
