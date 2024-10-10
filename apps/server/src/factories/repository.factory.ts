import { AbsTestFactory } from './abs.factory'

class RepositoryTestFactory extends AbsTestFactory {
  public async prepareAll(): Promise<void> {
    await this.setup()
  }

  public async closeEach(): Promise<void> {
    await this.release()
  }

  public async closeAll(): Promise<void> {
    await this.teardown()
  }
}

export { RepositoryTestFactory }
