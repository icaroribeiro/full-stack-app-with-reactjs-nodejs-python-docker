import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { container, DependencyContainer } from 'tsyringe'

import {
  HealthCheckService,
  IHealthCheckService,
} from '../api/components/health-check'
import {
  IUserRepository,
  IUserService,
  UserRepository,
  UserService,
} from '../api/components/user'
import { config } from '../config/config'
import { db } from '../db/db'

class AppContainer {
  private readonly _container: DependencyContainer = container

  constructor() {
    this.registerDatabaseContainer()
    this.registerRepositoryContainer()
    this.registerServiceContainer()
  }

  get container(): DependencyContainer {
    return this._container
  }

  private registerDatabaseContainer() {
    this._container.register<PostgresJsDatabase<Record<string, never>>>('db', {
      useValue: db.connect(config.getDatabaseURL()),
    })
  }

  private registerRepositoryContainer() {
    this._container.register<IUserRepository>('UserRepository', {
      useValue: new UserRepository(
        container.resolve<PostgresJsDatabase<Record<string, never>>>('db'),
      ),
    })
  }

  private registerServiceContainer() {
    this._container.register<IHealthCheckService>('HealthCheckService', {
      useValue: new HealthCheckService(
        this._container.resolve<PostgresJsDatabase<Record<string, never>>>(
          'db',
        ),
      ),
    })
    this._container.register<IUserService>('UserService', {
      useValue: new UserService(
        this._container.resolve<UserRepository>('UserRepository'),
      ),
    })
  }
}

export { AppContainer }
