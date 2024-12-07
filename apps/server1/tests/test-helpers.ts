import { Config } from '../src/config/config'
import { DBService } from '../src/services'
import path from 'path'
import { fileURLToPath } from 'url'
import { PostgreSqlContainer } from '@testcontainers/postgresql'

const currentPath = fileURLToPath(import.meta.url)
const appPath = path.resolve(currentPath, '..', '..')

async function startDatabaseContainer(config: Config): Promise<void> {
  const dbUser = config.getDatabaseUser()
  const dbPassword = config.getDatabasePassword()
  const dbName = config.getDatabaseName()
  const container = await new PostgreSqlContainer('postgres:latest')
    .withUsername(dbUser)
    .withPassword(dbPassword)
    .withDatabase(dbName)
    .start()
  const dbURL = container.getConnectionUri()
  config.setDataseURL(dbURL)
}

async function initializeDatabase(
  config: Config,
  dbService: DBService,
): Promise<void> {
  dbService.connectDatabase(config.getDatabaseURL())
  const migrationsFolder = path.join(appPath, 'db', 'migrations')
  await dbService.migrateDatabase(migrationsFolder)
}

async function finalizeDatabase(dbService: DBService): Promise<void> {
  await dbService.deleteDatabaseTables()
  await dbService.deactivateDatabase()
}

export { startDatabaseContainer, initializeDatabase, finalizeDatabase }
