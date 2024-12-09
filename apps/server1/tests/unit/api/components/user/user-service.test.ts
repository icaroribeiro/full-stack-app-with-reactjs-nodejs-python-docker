import { faker } from '@faker-js/faker'
import httpStatus from 'http-status'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  UserRepository,
  UserService,
} from '../../../../../src/api/components/user'
import { DBService } from '../../../../../src/services'
import { UserFactory } from '../../../../factories/user-factory'
import { ServerError } from '../../../../../src/server-error'

vi.mock('../../../../../src/api/components/user/user-repository', () => {
  const actual = vi.importActual<
    typeof import('../../../../../src/api/components/user/user-repository')
  >('../../../../../src/api/components/user/user-repository')
  return {
    ...actual,
    UserRepository: vi.fn(),
  }
})
describe('UserService', () => {
  const dbService = new DBService()
  const mockedUserRepository = vi.mocked(new UserRepository(dbService))
  const userService = new UserService(mockedUserRepository)
  const userFactory = new UserFactory()

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('.registerUser', () => {
    it('should define a function', () => {
      expect(typeof userService.registerUser).toBe('function')
    })

    it('should succeed and return user when user is registered', async () => {
      const mockedUser = userFactory.build()
      const mockedCreateUser = vi
        .fn()
        .mockResolvedValue(Promise.resolve(mockedUser))
      mockedUserRepository.createUser = mockedCreateUser
      const expectedResult = mockedUser

      const result = await userService.registerUser(mockedUser)

      expect(result).toEqual(expectedResult)
      expect(mockedUserRepository.createUser).toHaveBeenCalledWith(mockedUser)
    })

    it('should fail and throw exception when user cannot be registered', async () => {
      const mockedUser = userFactory.build()
      const error = new Error('failed')
      const message = 'An error occurred when registering a new user'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
        {
          context: mockedUser,
          cause: error,
        },
      )
      const mockedCreateUser = vi.fn().mockRejectedValue(error)
      mockedUserRepository.createUser = mockedCreateUser

      await expect(() =>
        userService.registerUser(mockedUser),
      ).rejects.toThrowError(serverError)
      expect(mockedUserRepository.createUser).toHaveBeenCalledWith(mockedUser)
    })
  })

  describe('.retrieveAndCountUsers', () => {
    it('should define a function', () => {
      expect(typeof userService.retrieveAndCountUsers).toBe('function')
    })

    it('should succeed and return a list of users with non-zero total when users exist', async () => {
      const page = faker.number.int()
      const limit = faker.number.int()
      const count = faker.number.int({ min: 1, max: 3 })
      const mockedUsers = userFactory.buildBatch(count)
      const mockedReadAndCountUsers = vi
        .fn()
        .mockResolvedValue(Promise.resolve([mockedUsers, count]))
      mockedUserRepository.readAndCountUsers = mockedReadAndCountUsers
      const expectedResult = [mockedUsers, count]

      const result = await userService.retrieveAndCountUsers(page, limit)

      expect(result).toEqual(expectedResult)
      expect(mockedUserRepository.readAndCountUsers).toHaveBeenCalledWith(
        page,
        limit,
      )
    })

    it('should fail and throw exception when list of users and total cannot be retrieved', async () => {
      const page = faker.number.int()
      const limit = faker.number.int()
      const error = new Error('failed')
      const message = 'An error occurred when reading and counting users'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
        {
          context: { page: page, limit: limit },
          cause: error,
        },
      )
      const mockedReadAndCountUsers = vi.fn().mockRejectedValue(error)
      mockedUserRepository.readAndCountUsers = mockedReadAndCountUsers

      await expect(() =>
        userService.retrieveAndCountUsers(page, limit),
      ).rejects.toThrowError(serverError)
      expect(mockedUserRepository.readAndCountUsers).toHaveBeenCalledWith(
        page,
        limit,
      )
    })
  })

  describe('.retrieveUser', () => {
    it('should define a function', () => {
      expect(typeof userService.retrieveUser).toBe('function')
    })

    it('should succeed and return user when user is retrieved', async () => {
      const mockedUser = userFactory.build()
      const mockedReadUser = vi
        .fn()
        .mockResolvedValue(Promise.resolve(mockedUser))
      mockedUserRepository.readUser = mockedReadUser
      const expectedResult = mockedUser

      const result = await userService.retrieveUser(mockedUser.id)

      expect(result).toEqual(expectedResult)
      expect(mockedUserRepository.readUser).toHaveBeenCalledWith(mockedUser.id)
    })

    it('should fail and throw exception when user cannot be retrieved', async () => {
      const mockedUser = userFactory.build()
      const error = new Error('failed')
      const message = 'An error occurred when retrieving a user'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
        {
          context: mockedUser.id,
          cause: error,
        },
      )
      const mockedReadUser = vi.fn().mockRejectedValue(new Error('failed'))
      mockedUserRepository.readUser = mockedReadUser

      await expect(() =>
        userService.retrieveUser(mockedUser.id),
      ).rejects.toThrowError(serverError)
      expect(mockedUserRepository.readUser).toHaveBeenCalledWith(mockedUser.id)
    })

    it('should fail and throw exception when user is not found', async () => {
      const mockedUser = userFactory.build()
      const message = 'User not found'
      const serverError = new ServerError(message, httpStatus.NOT_FOUND, {
        context: mockedUser.id,
        cause: undefined,
      })
      const mockedReadUser = vi.fn().mockResolvedValue(null)
      mockedUserRepository.readUser = mockedReadUser

      await expect(() =>
        userService.retrieveUser(mockedUser.id),
      ).rejects.toThrowError(serverError)
      expect(mockedUserRepository.readUser).toHaveBeenCalledWith(mockedUser.id)
    })
  })

  describe('.replaceUser', () => {
    it('should define a function', () => {
      expect(typeof userService.replaceUser).toBe('function')
    })

    it('should succeed and return user when user is replaced', async () => {
      const mockedUser = userFactory.build()
      const mockedUpdateUser = vi
        .fn()
        .mockResolvedValue(Promise.resolve(mockedUser))
      mockedUserRepository.updateUser = mockedUpdateUser
      const expectedResult = mockedUser

      const result = await userService.replaceUser(mockedUser.id, mockedUser)

      expect(result).toEqual(expectedResult)
      expect(mockedUserRepository.updateUser).toHaveBeenCalledWith(
        mockedUser.id,
        mockedUser,
      )
    })

    it('should fail and throw exception when user cannot be replaced', async () => {
      const mockedUser = userFactory.build()
      const error = new Error('failed')
      const message = 'An error occurred when replacing a user'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
        {
          context: { userId: mockedUser.id, user: mockedUser },
          cause: error,
        },
      )
      const mockedUpdateUser = vi.fn().mockRejectedValue(new Error('failed'))
      mockedUserRepository.updateUser = mockedUpdateUser

      await expect(() =>
        userService.replaceUser(mockedUser.id, mockedUser),
      ).rejects.toThrowError(serverError)
      expect(mockedUserRepository.updateUser).toHaveBeenCalledWith(
        mockedUser.id,
        mockedUser,
      )
    })

    it('should fail and throw exception when user is not found', async () => {
      const mockedUser = userFactory.build()
      const message = 'User not found'
      const serverError = new ServerError(message, httpStatus.NOT_FOUND, {
        context: mockedUser.id,
        cause: undefined,
      })
      const mockedUpdateUser = vi.fn().mockResolvedValue(null)
      mockedUserRepository.updateUser = mockedUpdateUser

      await expect(() =>
        userService.replaceUser(mockedUser.id, mockedUser),
      ).rejects.toThrowError(serverError)
      expect(mockedUserRepository.updateUser).toHaveBeenCalledWith(
        mockedUser.id,
        mockedUser,
      )
    })
  })

  describe('.removeUser', () => {
    it('should define a function', () => {
      expect(typeof userService.removeUser).toBe('function')
    })

    it('should succeed and return user when user is removed', async () => {
      const mockedUser = userFactory.build()
      const mockedDeleteUser = vi
        .fn()
        .mockResolvedValue(Promise.resolve(mockedUser))
      mockedUserRepository.deleteUser = mockedDeleteUser
      const expectedResult = mockedUser

      const result = await userService.removeUser(mockedUser.id)

      expect(result).toEqual(expectedResult)
      expect(mockedUserRepository.deleteUser).toHaveBeenCalledWith(
        mockedUser.id,
      )
    })

    it('should fail and throw exception when a user cannot be removed', async () => {
      const mockedUser = userFactory.build()
      const error = new Error('failed')
      const message = 'An error occurred when removing a user'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
        {
          context: mockedUser.id,
          cause: error,
        },
      )
      const mockedDeleteUser = vi.fn().mockRejectedValue(new Error('failed'))
      mockedUserRepository.deleteUser = mockedDeleteUser

      await expect(() =>
        userService.removeUser(mockedUser.id as string),
      ).rejects.toThrowError(serverError)
      expect(mockedUserRepository.deleteUser).toHaveBeenCalledWith(
        mockedUser.id,
      )
    })

    it('should fail and throw exception when user is not found', async () => {
      const mockedUser = userFactory.build()
      const message = 'User not found'
      const serverError = new ServerError(message, httpStatus.NOT_FOUND, {
        context: mockedUser.id,
        cause: undefined,
      })
      const mockedDeleteUser = vi.fn().mockResolvedValue(null)
      mockedUserRepository.deleteUser = mockedDeleteUser

      await expect(() =>
        userService.removeUser(mockedUser.id),
      ).rejects.toThrowError(serverError)
      expect(mockedUserRepository.deleteUser).toHaveBeenCalledWith(
        mockedUser.id,
      )
    })
  })
})
