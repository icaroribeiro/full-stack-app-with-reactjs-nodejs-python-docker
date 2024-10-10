import { INTERNAL_SERVER_ERROR } from 'http-status'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { db } from '../../../../db/db'
import { UserFactory } from '../../../../factories/helpers/user.factory'
import { ServerError } from '../../../server-error'
import { User } from '../user.models'
import { UserRepository } from '../user.repository'
import { UserService } from '../user.service'

vi.mock('../../db/db', (importOriginal) => {
  const original = importOriginal<typeof import('../../../../db/db')>()
  return {
    ...original,
    db: vi.fn(),
  }
})

describe('UserService', () => {
  const mockedDB = vi.mocked(db.connect(''))
  const mockedUserRepository = new UserRepository(mockedDB)
  const userFactory = new UserFactory()

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('.registerUser', () => {
    it('defines a function', () => {
      const userService = new UserService(mockedUserRepository)
      expect(typeof userService.registerUser).toBe('function')
    })

    it('should succeed and return a registered user', async () => {
      const mockedUser: User = userFactory.build()
      const mockedCreateUser = vi
        .fn()
        .mockReturnValueOnce(Promise.resolve(mockedUser))
      mockedUserRepository.createUser = mockedCreateUser
      const expectedResult = mockedUser

      const userService = new UserService(mockedUserRepository)
      const result = await userService.registerUser(mockedUser)

      expect(result).toEqual(expectedResult)
      expect(mockedCreateUser).toHaveBeenCalledWith(mockedUser)
    })

    it("should fail and throw exception when user can't be registered", async () => {
      const mockedUser: User = userFactory.build()
      const error = new Error('failed')
      const message = 'An error occurred when creating a new user into database'
      const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: mockedUser,
        cause: error,
      })
      const mockedCreateUser = vi.fn().mockRejectedValue(new Error('failed'))
      mockedUserRepository.createUser = mockedCreateUser

      const userService = new UserService(mockedUserRepository)

      await expect(() =>
        userService.registerUser(mockedUser),
      ).rejects.toThrowError(serverError)
      expect(mockedCreateUser).toHaveBeenCalledWith(mockedUser)
    })
  })
})
