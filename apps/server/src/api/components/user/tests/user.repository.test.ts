import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { UserFactory } from '../../../../factories/helpers/user.factory'
import { RepositoryTestFactory } from '../../../../factories/repository.factory'
import { User } from '../user.models'
import { UserRepository } from '../user.repository'

describe('UserRepository', async () => {
  const factory: RepositoryTestFactory = new RepositoryTestFactory()
  const userFactory = new UserFactory()

  let db: PostgresJsDatabase<Record<string, never>>
  beforeAll(async () => {
    await factory.prepareAll()
    db = factory.db
  }, factory.beforeAllTimeout)

  afterEach(async () => {
    await factory.closeEach()
  })

  afterAll(async () => {
    await factory.closeAll()
  })

  describe('.createUser', () => {
    it('defines a function', () => {
      const userRepository = new UserRepository(db)
      expect(typeof userRepository.createUser).toBe('function')
    })

    it('should succeed and return a created user', async () => {
      const mockedUser: User = userFactory.build()
      const expectedResult = mockedUser

      const userRepository = new UserRepository(db)
      const result = await userRepository.createUser(mockedUser)

      expect(result.id).not.toBeUndefined()
      expect(result.name).toEqual(expectedResult.name)
      expect(result.email).toEqual(expectedResult.email)
      const count = factory.getTableRowCount('users')
      await expect(count).resolves.toEqual(1)
    })
  })
})
