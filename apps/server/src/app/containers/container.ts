import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { container } from 'tsyringe'

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
import { db } from '../db/db'

container.register<PostgresJsDatabase<Record<string, never>>>('db', {
  useValue: db.connect(),
})

container.register<IUserRepository>('UserRepository', {
  useValue: new UserRepository(
    container.resolve<PostgresJsDatabase<Record<string, never>>>('db'),
  ),
})

container.register<IHealthCheckService>('HealthCheckService', {
  useValue: new HealthCheckService(
    container.resolve<PostgresJsDatabase<Record<string, never>>>('db'),
  ),
})

container.register<IUserService>('UserService', {
  useValue: new UserService(
    container.resolve<UserRepository>('UserRepository'),
  ),
})

export { container }
