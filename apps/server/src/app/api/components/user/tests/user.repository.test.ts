import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { UserFactory } from '../../../../factories/helpers/user.factory'
import { RepositoryFactory } from '../../../../factories/repository.factory'
import { User } from '../user.models'
import { UserRepository } from '../user.repository'

describe('UserRepository', async () => {
  const factory: RepositoryFactory = await RepositoryFactory.build()
  const db = factory.db
  const userFactory = new UserFactory()

  beforeAll(async () => {
    await factory.prepareAll()
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
    })
  })
})
