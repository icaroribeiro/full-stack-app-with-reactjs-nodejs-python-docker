import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import path from 'path'
import postgres from 'postgres'
import { fileURLToPath } from 'url'

import { config } from '../config/config'

const currentPath = fileURLToPath(import.meta.url)
const appPath = path.resolve(currentPath, '..', '..', '..', '..')

class RepositoryFactory {
  private container: StartedPostgreSqlContainer
  private client: postgres.Sql
  public readonly db: PostgresJsDatabase<Record<string, never>>

  public constructor(
    container: StartedPostgreSqlContainer,
    client: postgres.Sql,
    db: PostgresJsDatabase<Record<string, never>>,
  ) {
    this.container = container
    this.client = client
    this.db = db
  }

  public static async build(): Promise<RepositoryFactory> {
    const container = await this.setupDatabaseContainer()
    const { client, db } = await this.connectDatabase(
      container.getConnectionUri(),
    )
    return new RepositoryFactory(container, client, db)
  }

  public async prepareAll(): Promise<void> {
    await this.migrateDatabase(this.container.getConnectionUri())
  }

  public async closeAll(): Promise<void> {
    await this.client.end()
    await this.container.stop()
  }

  private static async setupDatabaseContainer(): Promise<StartedPostgreSqlContainer> {
    try {
      const databaseName = config.getDatabaseName()
      const databaseUser = config.getDatabaseUser()
      const databasePassword = config.getDatabasePassword()
      const databasePort = config.getDatabasePort()
      const container = await new PostgreSqlContainer()
        .withDatabase(databaseName)
        .withUsername(databaseUser)
        .withPassword(databasePassword)
        .withExposedPorts(parseInt(databasePort))
        .start()
      console.log('Test Database Container setted up successfully!') // `postgres://${container.getUsername()}:${container.getPassword()}@` +
      return container
    } catch (error) {
      console.error(error)
      const message = 'Test Database Container setup failed!'
      throw new Error(message)
    }
  }

  private static async connectDatabase(databaseURL: string): Promise<{
    client: postgres.Sql
    db: PostgresJsDatabase<Record<string, never>>
  }> {
    try {
      const client = postgres(databaseURL)
      const db = drizzle(client)
      console.log('Test Database connected successfully!')
      return { client, db }
    } catch (error) {
      console.error(error)
      const message = 'Test Database connection failed!'
      throw new Error(message)
    }
  }

  private async migrateDatabase(databaseURL: string) {
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
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
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

export { RepositoryFactory }
