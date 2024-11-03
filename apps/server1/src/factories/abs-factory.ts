import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
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
  private dbContainer?: StartedPostgreSqlContainer
  private readonly _dbService: DBService
  public beforeAllTimeout: number

  abstract prepareAll(): Promise<void>
  abstract closeEach(): Promise<void>
  abstract closeAll(): Promise<void>

  constructor() {
    this.dbContainer = undefined
    this._dbService = new DBService()
    this.beforeAllTimeout = 30000
  }

  public get dbService(): DBService {
    return this._dbService
  }

  protected async setupDatabaseContainer(): Promise<void> {
    try {
      const databaseUser = config.getDatabaseUser()
      const databasePassword = config.getDatabasePassword()
      const databaseName = config.getDatabaseName()
      const container = await new PostgreSqlContainer('postgres:latest')
        .withUsername(databaseUser)
        .withPassword(databasePassword)
        .withDatabase(databaseName)
        .start()
      const databaseURL = container.getConnectionUri()
      config.setDataseURL(databaseURL)
      this.dbContainer = container
      console.log('Database container setted up successfully!')
    } catch (error) {
      const message = 'Database container setup failed!'
      console.error(message)
      throw error
    }
  }

  protected async initializeDatabase(): Promise<void> {
    try {
      this._dbService.connectDatabase(config.getDatabaseURL())
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
      await this._dbService.migrateDatabase(migrationsFolder)
      console.log('Database initialized successfully!')
    } catch (error) {
      const message = 'Database initialization failed!'
      console.error(message, error)
      throw error
    }
  }

  protected async clearDatabaseTables(): Promise<void> {
    try {
      await this._dbService.clearDatabaseTables()
    } catch (error) {
      const message = 'Database cleaning failed!'
      console.error(message, error)
      throw error
    }
  }

  protected async deactivateDatabaseContainer(): Promise<void> {
    try {
      if (this.dbContainer !== undefined) {
        await this.dbContainer.stop()
        return
      }
      const message = 'Database container is undefined!'
      throw new Error(message)
    } catch (error) {
      const message = 'Database container deactivation failed!'
      console.error(message, error)
      throw error
    }
  }

  protected async deactivateDatabase(): Promise<void> {
    try {
      await this._dbService.deactivateDatabase()
    } catch (error) {
      const message = 'Database deactivation failed!'
      console.error(message, error)
      throw error
    }
  }
}

export { AbsTestFactory }
