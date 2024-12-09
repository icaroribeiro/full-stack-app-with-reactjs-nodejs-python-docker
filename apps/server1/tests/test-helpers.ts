import { Config } from '../src/config/config'
import { DBService } from '../src/services'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { Server } from '../src/server'
import { createServer, Server as HttpServer } from 'http'

const currentPath = fileURLToPath(import.meta.url)
const appPath = path.resolve(currentPath, '..', '..')

const config = new Config()

const dbService = new DBService()

async function startDatabaseContainer(
  config: Config,
): Promise<StartedPostgreSqlContainer> {
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
  return container
}

async function stopDatabaseContainer(
  container: StartedPostgreSqlContainer,
): Promise<void> {
  await container.stop()
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

function startHttpServer(config: Config): void {
  try {
    const server: Server = new Server(config)
    const httpServer: HttpServer = createServer(server.app)
    const port = parseInt(config.getPort())
    httpServer.listen(port, () => {
      console.log('Server started successfully!')
    })
    httpServer.on('close', () => {
      console.log('Server closed successfully!')
    })
  } catch (error) {
    console.error('Server starting failed!', error)
  }
}

export {
  config,
  dbService,
  startDatabaseContainer,
  stopDatabaseContainer,
  initializeDatabase,
  finalizeDatabase,
  startHttpServer,
}
