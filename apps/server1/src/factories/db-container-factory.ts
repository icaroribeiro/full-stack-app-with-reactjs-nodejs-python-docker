import { AbsTestFactory } from './abs-factory'

class DBContainerTestFactory extends AbsTestFactory {
  public async prepareAll(): Promise<void> {
    await this.setupDatabaseContainer()
  }

  public async closeEach(): Promise<void> {}

  public async closeAll(): Promise<void> {
    await this.deactivateDatabaseContainer()
  }
}

export { DBContainerTestFactory }
