import { AbsTestFactory } from './abs-factory'

class RepositoryTestFactory extends AbsTestFactory {
  public async prepareAll(): Promise<void> {
    await this.setupDatabaseContainer()
    await this.initializeDatabase()
  }

  public async closeEach(): Promise<void> {
    await this.clearDatabaseTables()
  }

  public async closeAll(): Promise<void> {
    await this.deactivateDatabase()
  }
}

export { RepositoryTestFactory }
