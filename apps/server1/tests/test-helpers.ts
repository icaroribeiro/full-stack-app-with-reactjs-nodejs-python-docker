import { Config } from '../src/config/config'
import { DBService } from '../src/services'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { Server } from '../src/server'
import { createServer, Server as HttpServer } from 'http'

const config = new Config()
const dbService = new DBService()
let httpServer: HttpServer

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

function startHttpServer(config: Config): void {
  try {
    const server: Server = new Server(config)
    httpServer = createServer(server.app)
    const port = parseInt(config.getPort())
    httpServer.listen(port, () => {
      console.log('Server started successfully!')
    })
  } catch (error) {
    console.error('Server starting failed!', error)
  }
}

function closeHttpServer(): void {
  try {
    httpServer.close(() => {
      console.log('Server closed successfully!')
    })
  } catch (error) {
    console.error('Server closing failed!', error)
  }
}

export {
  config,
  dbService,
  startDatabaseContainer,
  stopDatabaseContainer,
  startHttpServer,
  closeHttpServer,
}
