import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { sql } from 'drizzle-orm'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import path from 'path'
import postgres from 'postgres'
import { fileURLToPath } from 'url'

import { config } from '../config/config'

const currentPath = fileURLToPath(import.meta.url)
const appPath = path.resolve(currentPath, '..', '..', '..')

interface ITestFactory {
  prepareAll(): Promise<void>
  closeEach(): Promise<void>
  closeAll(): Promise<void>
}

abstract class AbsTestFactory implements ITestFactory {
  private container?: StartedPostgreSqlContainer = undefined
  private client?: postgres.Sql = undefined
  private _db?: PostgresJsDatabase<Record<string, never>>
  public beforeAllTimeout = 30000

  abstract prepareAll(): Promise<void>
  abstract closeEach(): Promise<void>
  abstract closeAll(): Promise<void>

  public async getTableRowCount(name: string): Promise<number> {
    if (this._db !== undefined) {
      const query = sql.raw(`
        SELECT count(*) 
        FROM ${name};
      `)
      const result = await this._db.execute(query)
      return result.length ? parseInt(result[0].count as string) : 0
    }
    return 0
  }

  public get db(): PostgresJsDatabase<Record<string, never>> {
    if (this._db === undefined) {
      const message = 'Database is undefined!'
      throw new Error(message)
    }
    return this._db
  }

  protected async initializeDatabase(): Promise<void> {
    try {
      const container = await this.setupDatabaseContainer()
      const databaseURL = container.getConnectionUri()
      process.env['DATABASE_URL'] = databaseURL
      const { client, db } = await this.connectDatabase(databaseURL)
      await this.migrateDatabase(databaseURL)
      this.container = container
      this.client = client
      this._db = db
    } catch (error) {
      const message = 'Database initialization failed!'
      console.error(message, error)
      throw error
    }
  }

  protected async clearDatabase(): Promise<void> {
    try {
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
      }
    } catch (error) {
      const message = 'Database cleaning failed!'
      console.error(message, error)
      throw error
    }
  }

  protected async disableDatabase(): Promise<void> {
    try {
      if (this.client !== undefined) {
        await this.client.end()
      }
      if (this.container !== undefined) {
        await this.container.stop()
      }
    } catch (error) {
      const message = 'Database closure failed!'
      console.error(message, error)
      throw error
    }
  }

  private async setupDatabaseContainer(): Promise<StartedPostgreSqlContainer> {
    try {
      const databaseUser = config.getDatabaseUser()
      const databasePassword = config.getDatabasePassword()
      const databaseName = config.getDatabaseName()
      const container = await new PostgreSqlContainer()
        .withUsername(databaseUser)
        .withPassword(databasePassword)
        .withDatabase(databaseName)
        .start()
      // console.log('Database container setted up successfully!')
      return container
    } catch (error) {
      console.error(error)
      const message = 'Database container setup failed!'
      throw new Error(message)
    }
  }

  private async connectDatabase(databaseURL: string): Promise<{
    client: postgres.Sql
    db: PostgresJsDatabase<Record<string, never>>
  }> {
    try {
      const client = postgres(databaseURL)
      const db = drizzle(client)
      // console.log('Database connected successfully!')
      return { client, db }
    } catch (error) {
      console.error(error)
      const message = 'Database connection failed!'
      throw new Error(message)
    }
  }

  private async migrateDatabase(databaseURL: string) {
    let migrationClient
    try {
      migrationClient = postgres(databaseURL, { max: 1 })
      // console.log('Migration client created successfully!')
    } catch (error) {
      console.error(error)
      const message = 'Migration client creation failed!'
      throw new Error(message)
    }
    try {
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
      await migrate(drizzle(migrationClient), {
        migrationsFolder: migrationsFolder,
      })
      // console.log('Migrations completed successfully!')
      await migrationClient.end()
    } catch (error) {
      console.error(error)
      const message = 'Migrations failed!'
      throw new Error(message)
    }
  }
}

export { AbsTestFactory }
