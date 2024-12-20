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
import {
  APIPaginationService,
  IAPIPaginationService,
} from '../services/api-pagination-service'
import { DBService, IDBService } from '../services/db-service'

class Container {
  private readonly _container: DependencyContainer

  constructor() {
    this._container = container
    this._container.register<IDBService>('DBService', {
      useValue: new DBService(),
    })
    this._container.register<IUserRepository>('UserRepository', {
      useValue: new UserRepository(
        this._container.resolve<DBService>('DBService'),
      ),
    })
    this._container.register<IHealthCheckService>('HealthCheckService', {
      useValue: new HealthCheckService(
        this._container.resolve<DBService>('DBService'),
      ),
    })
    this._container.register<IUserService>('UserService', {
      useValue: new UserService(
        this._container.resolve<UserRepository>('UserRepository'),
      ),
    })
    this._container.register<IAPIPaginationService>('APIPaginationService', {
      useValue: new APIPaginationService(),
    })
  }

  public get container(): DependencyContainer {
    return this._container
  }
}

export { Container }
