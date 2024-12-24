import * as schemas from '@db/schemas'
import httpStatus from 'http-status'
import { faker } from '@faker-js/faker'
import {
  User,
  UserMapper,
  UserRepository,
} from '../../../../../src/api/components/user'
import {
  config,
  dbService,
  startDatabaseContainer,
  stopDatabaseContainer,
} from '../../../../test-helpers'
import { UserFactory } from '../../../../factories/user-factory'
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql'

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import { ServerError } from '../../../../../src/server-error'

describe('UserRepository', async () => {
  const currentPath = fileURLToPath(import.meta.url)
  const appPath = path.resolve(currentPath, '..', '..', '..', '..', '..', '..')
  const migrationsFolder = path.join(appPath, 'db', 'migrations')
  const userRepository = new UserRepository(dbService)
  const userFactory = new UserFactory()
  const userMapper = new UserMapper()
  let container: StartedPostgreSqlContainer
  const timeout = 60000

  beforeAll(async () => {
    container = await startDatabaseContainer(config)
    dbService.connectDatabase(config.getDatabaseURL())
  }, timeout)

  beforeEach(async () => {
    await dbService.clearDatabaseTables()
    await dbService.deleteDatabaseTables()
  })

  afterAll(async () => {
    await dbService.disconnectDatabase()
    await stopDatabaseContainer(container)
  }, timeout)

  describe('.createUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.createUser).toBe('function')
    })

    it('should succeed and return user when user is created', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userMapper.toDomain(userFactory.build())
      const expectedResult = userMapper.toDomain(mockedUser)

      const result = await userRepository.createUser(mockedUser)

      const rowCount = 1
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).not.toBeUndefined()
      expect(result?.id).not.toBeNull()
      expect(result?.name).toEqual(expectedResult.name)
      expect(result?.email).toEqual(expectedResult.email)
      expect(result?.createdAt).not.toBeNull()
      expect(result?.updatedAt).not.toBeNull()
    })

    it('should fail and throw exception when user schema does not exist into database', async () => {
      const mockedUser = userMapper.toDomain(userFactory.build())
      const message = 'An error occurred when creating a user into database'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await userRepository.createUser(mockedUser)
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
    })
  })

  describe('.readAndCountUsers', () => {
    it('should define a function', () => {
      expect(typeof userRepository.readAndCountUsers).toBe('function')
    })

    it('should succeed and return empty list of users with zero total when users do not exist', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const page = faker.number.int({ min: 1, max: 3 })
      const limit = faker.number.int({ min: 1, max: 3 })
      const expectedRecords: User[] = []
      const expectedTotal = 0

      const [records, total] = await userRepository.readAndCountUsers(
        page,
        limit,
      )

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(records).toEqual(expectedRecords)
      expect(total).toEqual(expectedTotal)
    })

    it('should succeed and return a list of users with non-zero total when page is the first one and can be filled', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const count = 3
      const mockedUserList = userFactory
        .buildBatch(count)
        .map((u) => userMapper.toDomain(u))
      const domainUserList: User[] = []
      for (const mockedUser of mockedUserList) {
        const rawUserData = userMapper.toPersistence(mockedUser)
        const insertedUser = await dbService.db
          .insert(schemas.userSchema)
          .values(rawUserData)
          .returning()
        const domainUser = insertedUser.map((u) => userMapper.toDomain(u))[0]
        domainUserList.push(domainUser)
      }
      const page = 1
      const limit = 1
      const expectedRecords: User[] = [
        domainUserList[domainUserList.length - 1],
      ]
      const expectedTotal = count

      const [records, total] = await userRepository.readAndCountUsers(
        page,
        limit,
      )

      const rowCount = count
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(records).toEqual(expectedRecords)
      expect(total).toEqual(expectedTotal)
    })

    it('should succeed and return an empty list of users with non-zero total when page is not the first one and cannot be filled', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const count = 3
      const mockedUserList = userFactory
        .buildBatch(count)
        .map((u) => userMapper.toDomain(u))
      const domainUserList: User[] = []
      for (const mockedUser of mockedUserList) {
        const rawUserData = userMapper.toPersistence(mockedUser)
        const insertedUser = await dbService.db
          .insert(schemas.userSchema)
          .values(rawUserData)
          .returning()
        const domainUser = insertedUser.map((u) => userMapper.toDomain(u))[0]
        domainUserList.push(domainUser)
      }
      const page = 2
      const limit = 3
      const expectedRecords: User[] = []
      const expectedTotal = count

      const [records, total] = await userRepository.readAndCountUsers(
        page,
        limit,
      )

      const rowCount = count
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(records).toEqual(expectedRecords)
      expect(total).toEqual(expectedTotal)
    })

    it('should succeed and return a list of users with non-zero total when page is not the first and can be filled', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const count = 5
      const mockedUserList = userFactory
        .buildBatch(count)
        .map((u) => userMapper.toDomain(u))
      const domainUserList: User[] = []
      for (const mockedUser of mockedUserList) {
        const rawUserData = userMapper.toPersistence(mockedUser)
        const insertedUser = await dbService.db
          .insert(schemas.userSchema)
          .values(rawUserData)
          .returning()
        const domainUser = insertedUser.map((u) => userMapper.toDomain(u))[0]
        domainUserList.push(domainUser)
      }
      const page = 3
      const limit = 2
      const expectedRecords: User[] = [domainUserList[0]]
      const expectedTotal = 5

      const [records, total] = await userRepository.readAndCountUsers(
        page,
        limit,
      )

      const rowCount = 5
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(records).toEqual(expectedRecords)
      expect(total).toEqual(expectedTotal)
    })

    it('should fail and throw exception when user schema does not exist into database', async () => {
      const page = faker.number.int({ min: 1, max: 3 })
      const limit = faker.number.int({ min: 1, max: 3 })
      const message =
        'An error occurred when reading and counting users from database'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await userRepository.readAndCountUsers(page, limit)
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
    })
  })

  describe('.readUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.readUser).toBe('function')
    })

    it('should succeed and return user when user is read', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userMapper.toDomain(userFactory.build())
      const rawUserData = userMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.userSchema)
        .values(rawUserData)
        .returning()
      const domainUser = insertedUser.map((u) => userMapper.toDomain(u))[0]
      const expectedResult = domainUser

      const result = await userRepository.readUser(domainUser.id as string)

      const rowCount = 1
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).not.toBeUndefined()
      expect(result?.id).toEqual(expectedResult.id)
      expect(result?.name).toEqual(expectedResult.name)
      expect(result?.email).toEqual(expectedResult.email)
      expect(result?.createdAt).toEqual(expectedResult.createdAt)
      expect(result?.updatedAt).toEqual(expectedResult.updatedAt)
    })

    it('should succeed and return undefined when user is not found', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userMapper.toDomain(userFactory.build())

      const result = await userRepository.readUser(mockedUser.id as string)

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).toBeUndefined()
    })

    it('should fail and throw exception when user schema does not exist into database', async () => {
      const mockedUser = userMapper.toDomain(userFactory.build())
      const message = 'An error occurred when reading a user from database'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await userRepository.readUser(mockedUser.id as string)
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
    })
  })

  describe('.updateUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.updateUser).toBe('function')
    })

    it('should succeed and return user when user is updated', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userMapper.toDomain(userFactory.build())
      const rawUserData = userMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.userSchema)
        .values(rawUserData)
        .returning()
      const domainUser = userMapper.toDomain(userFactory.build())
      domainUser.id = insertedUser.map((u) => userMapper.toDomain(u))[0].id
      domainUser.createdAt = insertedUser.map((u) =>
        userMapper.toDomain(u),
      )[0].createdAt
      const expectedResult = domainUser

      const result = await userRepository.updateUser(
        domainUser.id as string,
        domainUser,
      )

      const rowCount = 1
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).not.toBeUndefined()
      expect(result?.id).toEqual(expectedResult.id)
      expect(result?.name).toEqual(expectedResult.name)
      expect(result?.email).toEqual(expectedResult.email)
      expect(result?.createdAt).toEqual(expectedResult.createdAt)
      expect(result?.updatedAt).not.toEqual(expectedResult.updatedAt)
    })

    it('should succeed and return undefined when user is not found', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userMapper.toDomain(userFactory.build())

      const result = await userRepository.updateUser(
        mockedUser.id as string,
        mockedUser,
      )

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).toBeUndefined()
    })

    it('should fail and throw exception when user schema does not exist into database', async () => {
      const mockedUser = userMapper.toDomain(userFactory.build())
      const message = 'An error occurred when updating a user from database'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await userRepository.updateUser(mockedUser.id as string, mockedUser)
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
    })
  })

  describe('.deleteUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.deleteUser).toBe('function')
    })

    it('should succeed and return user when user is deleted', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userMapper.toDomain(userFactory.build())
      const rawUserData = userMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.userSchema)
        .values(rawUserData)
        .returning()
      const domainUser = insertedUser.map((u) => userMapper.toDomain(u))[0]
      const expectedResult = domainUser

      const result = await userRepository.deleteUser(domainUser.id as string)

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).not.toBeUndefined()
      expect(result?.id).toEqual(expectedResult.id)
      expect(result?.name).toEqual(expectedResult.name)
      expect(result?.email).toEqual(expectedResult.email)
      expect(result?.createdAt).toEqual(expectedResult.createdAt)
      expect(result?.updatedAt).toEqual(expectedResult.updatedAt)
    })
  })

  it('should succeed and return undefined when user is not found', async () => {
    await dbService.migrateDatabase(migrationsFolder)
    const mockedUser = userMapper.toDomain(userFactory.build())

    const result = await userRepository.deleteUser(mockedUser.id as string)

    const rowCount = 0
    await expect(dbService.getDatabaseTableRowCount('users')).resolves.toEqual(
      rowCount,
    )
    expect(result).toBeUndefined()
  })

  it('should fail and throw exception when user schema does not exist into database', async () => {
    const mockedUser = userMapper.toDomain(userFactory.build())
    const message = 'An error occurred when deleting a user from database'
    const serverError = new ServerError(
      message,
      httpStatus.INTERNAL_SERVER_ERROR,
    )

    try {
      await userRepository.deleteUser(mockedUser.id as string)
    } catch (error) {
      const thrownError = error as unknown as ServerError
      expect(thrownError.message).toEqual(serverError.message)
      expect(thrownError.statusCode).toEqual(serverError.statusCode)
      expect(thrownError.isOperational).toEqual(serverError.isOperational)
    }
  })
})
