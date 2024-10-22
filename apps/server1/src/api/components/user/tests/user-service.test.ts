import { INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { UserFactory } from '../../../../factories/helpers/user-factory'
import { DBService } from '../../../../services'
import { ServerError } from '../../../../server-error'
import { User, UserList, UserRepository, UserService } from '..'

describe('UserService', () => {
  const mockedDBService = new DBService()
  const mockedUserRepository = new UserRepository(mockedDBService)
  const userFactory = new UserFactory()

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('.registerUser', () => {
    it('should define a function', () => {
      const userService = new UserService(mockedUserRepository)

      expect(typeof userService.registerUser).toBe('function')
    })

    it('should succeed and return a registered user', async () => {
      const mockedUser: User = userFactory.build()
      const mockedCreateUser = vi
        .fn()
        .mockResolvedValue(Promise.resolve(mockedUser))
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

  // describe('.retrieveUsers', () => {
  //   it('should define a function', () => {
  //     const userService = new UserService(mockedUserRepository, mockedPaginationService)

  //     expect(typeof userService.retrieveUsers).toBe('function')
  //   })

  //   it('should succeed and return a list of users', async () => {
  //     const count = 3
  //     const mockedUsers: UserList = userFactory.buildMany(count)
  //     const mockedReadUsers = vi
  //       .fn()
  //       .mockResolvedValue(Promise.resolve(mockedUsers))
  //     mockedUserRepository.readUsers = mockedReadUsers
  //     const expectedResult = mockedUsers

  //     const userService = new UserService(mockedUserRepository, mockedPaginationService)
  //     const result = await userService.retrieveUsers()

  //     expect(result).toEqual(expectedResult)
  //     expect(mockedReadUserList).toHaveBeenCalled()
  //   })

  //   it("should fail and throw exception when list of users can't be retrieved", async () => {
  //     const error = new Error('failed')
  //     const message =
  //       'An error occurred when reading users from database'
  //     const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
  //       context: undefined,
  //       cause: error,
  //     })
  //     const mockedReadUsers = vi.fn().mockRejectedValue(new Error('failed'))
  //     mockedUserRepository.readUsers = mockedReadUsers

  //     const userService = new UserService(mockedUserRepository, mockedPaginationService)

  //     await expect(() => userService.retrieveUsers()).rejects.toThrowError(
  //       serverError,
  //     )
  //     expect(mockedReadUserList).toHaveBeenCalled()
  //   })
  // })

  describe('.retrieveAndCountUsers', () => {
    it('should define a function', () => {
      const userService = new UserService(mockedUserRepository)

      expect(typeof userService.retrieveAndCountUsers).toBe('function')
    })

    it('should succeed and return a list of users with non-zero total', async () => {
      const page = 1
      const limit = 3
      const count = 3
      const mockedUsers: UserList = userFactory.buildMany(count)
      const mockedReadAndCountUsers = vi
        .fn()
        .mockResolvedValue(Promise.resolve([mockedUsers, 3]))
      mockedUserRepository.readAndCountUsers = mockedReadAndCountUsers
      const expectedResult = [mockedUsers, 3]

      const userService = new UserService(mockedUserRepository)
      const result = await userService.retrieveAndCountUsers(page, limit)

      expect(result).toEqual(expectedResult)
      expect(mockedReadAndCountUsers).toHaveBeenCalledWith(page, limit)
    })

    it("should fail and throw exception when list of users and total can't be retrieved", async () => {
      const page = 1
      const limit = 3
      const error = new Error('failed')
      const message =
        'An error occurred when reading and counting users from database'
      const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: undefined,
        cause: error,
      })
      const mockedReadAndCountUsers = vi
        .fn()
        .mockRejectedValue(new Error('failed'))
      mockedUserRepository.readAndCountUsers = mockedReadAndCountUsers

      const userService = new UserService(mockedUserRepository)

      await expect(() =>
        userService.retrieveAndCountUsers(page, limit),
      ).rejects.toThrowError(serverError)
      expect(mockedReadAndCountUsers).toHaveBeenCalledWith(page, limit)
    })
  })

  describe('.retrieveUser', () => {
    it('should define a function', () => {
      const userService = new UserService(mockedUserRepository)

      expect(typeof userService.retrieveUser).toBe('function')
    })

    it('should succeed and return a user', async () => {
      const mockedUser: User = userFactory.build()
      const mockedReadUser = vi
        .fn()
        .mockResolvedValue(Promise.resolve(mockedUser))
      mockedUserRepository.readUser = mockedReadUser
      const expectedResult = mockedUser

      const userService = new UserService(mockedUserRepository)
      const result = await userService.retrieveUser(mockedUser.id as string)

      expect(result).toEqual(expectedResult)
      expect(mockedReadUser).toHaveBeenCalledWith(mockedUser.id)
    })

    it('should fail and throw exception when user is not found', async () => {
      const mockedUser: User = userFactory.build()
      const message = 'User not found'
      const serverError = new ServerError(message, NOT_FOUND, {
        context: mockedUser.id,
        cause: undefined,
      })
      const mockedReadUser = vi.fn().mockResolvedValue(undefined)
      mockedUserRepository.readUser = mockedReadUser

      const userService = new UserService(mockedUserRepository)

      await expect(() =>
        userService.retrieveUser(mockedUser.id as string),
      ).rejects.toThrowError(serverError)
      expect(mockedReadUser).toHaveBeenCalledWith(mockedUser.id)
    })

    it("should fail and throw exception when a user can't be retrieved", async () => {
      const mockedUser: User = userFactory.build()
      const error = new Error('failed')
      const message = 'An error occurred when reading a user from database'
      const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: mockedUser.id,
        cause: error,
      })
      const mockedReadUser = vi.fn().mockRejectedValue(new Error('failed'))
      mockedUserRepository.readUser = mockedReadUser

      const userService = new UserService(mockedUserRepository)

      await expect(() =>
        userService.retrieveUser(mockedUser.id as string),
      ).rejects.toThrowError(serverError)
      expect(mockedReadUser).toHaveBeenCalledWith(mockedUser.id)
    })
  })

  describe('.replaceUser', () => {
    it('should define a function', () => {
      const userService = new UserService(mockedUserRepository)

      expect(typeof userService.replaceUser).toBe('function')
    })

    it('should fail and throw exception when user is not found', async () => {
      const mockedUser: User = userFactory.build()
      const message = 'User not found'
      const serverError = new ServerError(message, NOT_FOUND, {
        context: mockedUser.id,
        cause: undefined,
      })
      const mockedUpdateUser = vi.fn().mockResolvedValue(undefined)
      mockedUserRepository.updateUser = mockedUpdateUser

      const userService = new UserService(mockedUserRepository)

      await expect(() =>
        userService.replaceUser(mockedUser.id as string, mockedUser),
      ).rejects.toThrowError(serverError)
      expect(mockedUpdateUser).toHaveBeenCalledWith(mockedUser.id, mockedUser)
    })

    it('should succeed and return a replaced user', async () => {
      const mockedUser: User = userFactory.build()
      const mockedUpdateUser = vi
        .fn()
        .mockResolvedValue(Promise.resolve(mockedUser))
      mockedUserRepository.updateUser = mockedUpdateUser
      const expectedResult = mockedUser

      const userService = new UserService(mockedUserRepository)
      const result = await userService.replaceUser(
        mockedUser.id as string,
        mockedUser,
      )

      expect(result).toEqual(expectedResult)
      expect(mockedUpdateUser).toHaveBeenCalledWith(mockedUser.id, mockedUser)
    })

    it("should fail and throw exception when a user can't be replaced", async () => {
      const mockedUser: User = userFactory.build()
      const error = new Error('failed')
      const message = 'An error occurred when updating a user in database'
      const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: { userId: mockedUser.id, user: mockedUser },
        cause: error,
      })
      const mockedUpdateUser = vi.fn().mockRejectedValue(new Error('failed'))
      mockedUserRepository.updateUser = mockedUpdateUser

      const userService = new UserService(mockedUserRepository)

      await expect(() =>
        userService.replaceUser(mockedUser.id as string, mockedUser),
      ).rejects.toThrowError(serverError)
      expect(mockedUpdateUser).toHaveBeenCalledWith(mockedUser.id, mockedUser)
    })
  })

  describe('.removeUser', () => {
    it('should define a function', () => {
      const userService = new UserService(mockedUserRepository)

      expect(typeof userService.removeUser).toBe('function')
    })

    it('should fail and throw exception when user is not found', async () => {
      const mockedUser: User = userFactory.build()
      const message = 'User not found'
      const serverError = new ServerError(message, NOT_FOUND, {
        context: mockedUser.id,
        cause: undefined,
      })
      const mockedDeleteUser = vi.fn().mockResolvedValue(undefined)
      mockedUserRepository.deleteUser = mockedDeleteUser

      const userService = new UserService(mockedUserRepository)

      await expect(() =>
        userService.removeUser(mockedUser.id as string),
      ).rejects.toThrowError(serverError)
      expect(mockedDeleteUser).toHaveBeenCalledWith(mockedUser.id)
    })

    it('should succeed and return a removed user', async () => {
      const mockedUser: User = userFactory.build()
      const mockedDeleteUser = vi
        .fn()
        .mockResolvedValue(Promise.resolve(mockedUser))
      mockedUserRepository.deleteUser = mockedDeleteUser
      const expectedResult = mockedUser

      const userService = new UserService(mockedUserRepository)
      const result = await userService.removeUser(mockedUser.id as string)

      expect(result).toEqual(expectedResult)
      expect(mockedDeleteUser).toHaveBeenCalledWith(mockedUser.id)
    })

    it("should fail and throw exception when a user can't be removed", async () => {
      const mockedUser: User = userFactory.build()
      const error = new Error('failed')
      const message = 'An error occurred when deleting a user from database'
      const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: mockedUser.id,
        cause: error,
      })
      const mockedDeleteUser = vi.fn().mockRejectedValue(new Error('failed'))
      mockedUserRepository.deleteUser = mockedDeleteUser

      const userService = new UserService(mockedUserRepository)

      await expect(() =>
        userService.removeUser(mockedUser.id as string),
      ).rejects.toThrowError(serverError)
      expect(mockedDeleteUser).toHaveBeenCalledWith(mockedUser.id)
    })
  })
})
