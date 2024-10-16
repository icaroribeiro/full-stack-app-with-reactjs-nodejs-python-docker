import { AbsTestFactory } from './abs-factory'

class RepositoryTestFactory extends AbsTestFactory {
  public async prepareAll(): Promise<void> {
    await this.initializeDatabase()
  }

  public async closeEach(): Promise<void> {
    await this.clearDatabase()
  }

  public async closeAll(): Promise<void> {
    await this.disableDatabase()
  }
}

export { RepositoryTestFactory }
