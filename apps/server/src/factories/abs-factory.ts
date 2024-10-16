import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { sql } from 'drizzle-orm'
import path from 'path'
import { fileURLToPath } from 'url'

import { config } from '../config/config'
import { DBService } from '../services'

const currentPath = fileURLToPath(import.meta.url)
const appPath = path.resolve(currentPath, '..', '..', '..')

interface ITestFactory {
  prepareAll(): Promise<void>
  closeEach(): Promise<void>
  closeAll(): Promise<void>
}

abstract class AbsTestFactory implements ITestFactory {
  private _dbContainer?: StartedPostgreSqlContainer = undefined
  private readonly _dbService: DBService = new DBService()
  public beforeAllTimeout = 1000000

  abstract prepareAll(): Promise<void>
  abstract closeEach(): Promise<void>
  abstract closeAll(): Promise<void>

  public async getTableRowCount(name: string): Promise<number> {
    if (this._dbService.db !== undefined) {
      const query = sql.raw(`
        SELECT count(*) 
        FROM ${name};
      `)
      const result = await this._dbService.db.execute(query)
      return result.length ? parseInt(result[0].count as string) : 0
    }
    return 0
  }

  public get dbService(): DBService {
    return this._dbService
  }

  protected async initializeDatabase(): Promise<void> {
    try {
      const dbContainer = await this.setupDatabaseContainer()
      const databaseURL = dbContainer.getConnectionUri()
      process.env['DATABASE_URL'] = databaseURL
      // await this.connectDatabase(databaseURL)
      this._dbService.connectDatabase(databaseURL)
      // console.log('connected')
      // const migrationsFolder = path.join(appPath, 'db', 'migrations')
      // console.log('migrationsFolder=', migrationsFolder)
      // await this._dbService.migrateDatabase(databaseURL, migrationsFolder)
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
      await this._dbService.migrateDatabase(databaseURL, migrationsFolder)
      this._dbContainer = dbContainer
      console.log('Database initialized successfully!')
    } catch (error) {
      const message = 'Database initialization failed!'
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
      console.log('Database container setted up successfully!')
      return container
    } catch (error) {
      const message = 'Database container setup failed!'
      console.error(message)
      throw error
    }
  }

  protected async clearDatabase(): Promise<void> {
    try {
      if (this._dbService.db !== undefined) {
        const query = sql<string>`
				SELECT table_name
				FROM information_schema.tables
					WHERE table_schema = 'public'
						AND table_type = 'BASE TABLE';
			`
        const tables = await this._dbService.db.execute(query)
        for (const table of tables) {
          const query = sql.raw(`
          TRUNCATE TABLE ${table.table_name} CASCADE;
        `)
          await this._dbService.db.execute(query)
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
      if (this._dbService.client !== undefined) {
        await this._dbService.client.end()
      }
      if (this._dbContainer !== undefined) {
        await this._dbContainer.stop()
      }
    } catch (error) {
      const message = 'Database closure failed!'
      console.error(message, error)
      throw error
    }
  }
}

export { AbsTestFactory }
