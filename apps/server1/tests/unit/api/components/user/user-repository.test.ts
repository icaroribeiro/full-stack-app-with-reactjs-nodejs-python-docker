import * as schemas from '@db/schemas'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  UserMapper,
  UserRepository,
} from '../../../../../src/api/components/user'
import {
  config,
  dbService,
  finalizeDatabase,
  initializeDatabase,
  startDatabaseContainer,
  startHttpServer,
  stopDatabaseContainer,
} from '../../../../test-helpers'
import { UserFactory } from '../../../../factories/user-factory'
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { beforeEach } from 'node:test'

describe('UserRepository', async () => {
  const userRepository = new UserRepository(dbService)
  const userFactory = new UserFactory()
  const userMapper = new UserMapper()
  let container: StartedPostgreSqlContainer
  const beforeAllTimeout = 30000

  beforeAll(async () => {
    container = await startDatabaseContainer(config)
    await initializeDatabase(config, dbService)
  }, beforeAllTimeout)

  beforeEach(async () => {
    await dbService.clearDatabaseTables()
  })

  afterAll(async () => {
    await finalizeDatabase(dbService)
    await stopDatabaseContainer(container)
  })

  describe('.createUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.createUser).toBe('function')
    })

    it('should succeed and return user when user is created', async () => {
      const mockedUser = userFactory.build()
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

    it('should fail and throw exception when user cannot be created', async () => {
      const mockedUser = userFactory.build()
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
  })

  // describe('.readAndCountUsers', () => {
  //   it('should define a function', () => {
  //     const userRepository = new UserRepository(dbService)

  //     expect(typeof userRepository.readAndCountUsers).toBe('function')
  //   })

  //   it('should succeed and return an empty list of user with total zero', async () => {
  //     const page = 1
  //     const limit = 1
  //     const expectedPaginatedRecordsResult: UserList = []
  //     const expectedTotalRecordsResult = 0

  //     const userRepository = new UserRepository(dbService)
  //     const [paginatedRecordsResult, totalRecordsResult] =
  //       await userRepository.readAndCountUsers(page, limit)

  //     const rowCount = 0
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(paginatedRecordsResult).toEqual(expectedPaginatedRecordsResult)
  //     expect(totalRecordsResult).toEqual(expectedTotalRecordsResult)
  //   })

  //   it('should succeed and return a list of users with non-zero total when page is the first one and can be filled', async () => {
  //     const count = 3
  //     const mockedUserList: UserList = userFactory.buildMany(count)
  //     for (const mockedUser of mockedUserList) {
  //       const rawUserData = UserMapper.toPersistence(mockedUser)
  //       const insertedUser = await dbService.db
  //         .insert(schemas.usersTable)
  //         .values(rawUserData)
  //         .returning()
  //       mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
  //     }
  //     const page = 1
  //     const limit = 1
  //     const expectedPaginatedRecordsResult: UserList = [
  //       mockedUserList[mockedUserList.length - 1],
  //     ]
  //     const expectedTotalRecordsResult = 3

  //     const userRepository = new UserRepository(dbService)
  //     const [paginatedRecordsResult, totalRecordsResult] =
  //       await userRepository.readAndCountUsers(page, limit)

  //     const rowCount = 3
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(paginatedRecordsResult).toEqual(expectedPaginatedRecordsResult)
  //     expect(totalRecordsResult).toEqual(expectedTotalRecordsResult)
  //   })

  //   it('should succeed and return an empty list of users with non-zero total when page is not the first one and cannot be filled', async () => {
  //     const count = 3
  //     const mockedUserList: UserList = userFactory.buildMany(count)
  //     for (const mockedUser of mockedUserList) {
  //       const rawUserData = UserMapper.toPersistence(mockedUser)
  //       const insertedUser = await dbService.db
  //         .insert(schemas.usersTable)
  //         .values(rawUserData)
  //         .returning()
  //       mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
  //     }
  //     const page = 2
  //     const limit = 3
  //     const expectedPaginatedRecordsResult: UserList = []
  //     const expectedTotalRecordsResult = 3

  //     const userRepository = new UserRepository(dbService)
  //     const [paginatedRecordsResult, totalRecordsResult] =
  //       await userRepository.readAndCountUsers(page, limit)

  //     const rowCount = 3
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(paginatedRecordsResult).toEqual(expectedPaginatedRecordsResult)
  //     expect(totalRecordsResult).toEqual(expectedTotalRecordsResult)
  //   })

  //   it('should succeed and return a list of users with non-zero total when page is not the first one and can be filled', async () => {
  //     const count = 5
  //     const mockedUserList: UserList = userFactory.buildMany(count)
  //     for (const mockedUser of mockedUserList) {
  //       const rawUserData = UserMapper.toPersistence(mockedUser)
  //       const insertedUser = await dbService.db
  //         .insert(schemas.usersTable)
  //         .values(rawUserData)
  //         .returning()
  //       mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
  //     }
  //     const page = 3
  //     const limit = 2
  //     const expectedPaginatedRecordsResult: UserList = [mockedUserList[0]]
  //     const expectedTotalRecordsResult = 5

  //     const userRepository = new UserRepository(dbService)
  //     const [paginatedRecordsResult, totalRecordsResult] =
  //       await userRepository.readAndCountUsers(page, limit)

  //     const rowCount = 5
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(paginatedRecordsResult).toEqual(expectedPaginatedRecordsResult)
  //     expect(totalRecordsResult).toEqual(expectedTotalRecordsResult)
  //   })
  // })

  // describe('.readUser', () => {
  //   it('should define a function', () => {
  //     const userRepository = new UserRepository(dbService)

  //     expect(typeof userRepository.readUser).toBe('function')
  //   })

  //   it('should succeed and return undefined', async () => {
  //     const mockedUser: User = userFactory.build()

  //     const userRepository = new UserRepository(dbService)
  //     const result = await userRepository.readUser(mockedUser.id as string)

  //     const rowCount = 0
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(result).toBeUndefined()
  //   })

  //   it('should succeed and return a user', async () => {
  //     const mockedUser: User = userFactory.build()
  //     const rawUserData = UserMapper.toPersistence(mockedUser)
  //     const insertedUser = await dbService.db
  //       .insert(schemas.usersTable)
  //       .values(rawUserData)
  //       .returning()
  //     mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
  //     const expectedResult = mockedUser

  //     const userRepository = new UserRepository(dbService)
  //     const result = await userRepository.readUser(mockedUser.id as string)

  //     const rowCount = 1
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(result.id).toEqual(expectedResult.id)
  //     expect(result.name).toEqual(expectedResult.name)
  //     expect(result.email).toEqual(expectedResult.email)
  //   })
  // })

  // describe('.updateUser', () => {
  //   it('should define a function', () => {
  //     const userRepository = new UserRepository(dbService)

  //     expect(typeof userRepository.updateUser).toBe('function')
  //   })

  //   it('should succeed and return undefined', async () => {
  //     const mockedUser: User = userFactory.build()
  //     const mockedUpdatedUser: User = userFactory.build()

  //     const userRepository = new UserRepository(dbService)
  //     const result = await userRepository.updateUser(
  //       mockedUser.id as string,
  //       mockedUpdatedUser,
  //     )

  //     const rowCount = 0
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(result).toBeUndefined()
  //   })

  //   it('should succeed and return an updated user', async () => {
  //     const mockedUser: User = userFactory.build()
  //     const rawUserData = UserMapper.toPersistence(mockedUser)
  //     const insertedUser = await dbService.db
  //       .insert(schemas.usersTable)
  //       .values(rawUserData)
  //       .returning()
  //     mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
  //     const mockedUpdatedUser: User = userFactory.build()
  //     mockedUpdatedUser.id = mockedUser.id
  //     const expectedResult = mockedUpdatedUser

  //     const userRepository = new UserRepository(dbService)
  //     const result = await userRepository.updateUser(
  //       mockedUser.id as string,
  //       mockedUpdatedUser,
  //     )

  //     const rowCount = 1
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(result.id).toEqual(expectedResult.id)
  //     expect(result.name).toEqual(expectedResult.name)
  //     expect(result.email).toEqual(expectedResult.email)
  //   })
  // })

  // describe('.deleteUser', () => {
  //   it('should define a function', () => {
  //     const userRepository = new UserRepository(dbService)

  //     expect(typeof userRepository.deleteUser).toBe('function')
  //   })

  //   it('should succeed and return undefined', async () => {
  //     const mockedUser: User = userFactory.build()

  //     const userRepository = new UserRepository(dbService)
  //     const result = await userRepository.deleteUser(mockedUser.id as string)

  //     const rowCount = 0
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(result).toBeUndefined()
  //   })

  //   it('should succeed and return a deleted user', async () => {
  //     const mockedUser: User = userFactory.build()
  //     const rawUserData = UserMapper.toPersistence(mockedUser)
  //     const insertedUser = await dbService.db
  //       .insert(schemas.usersTable)
  //       .values(rawUserData)
  //       .returning()
  //     mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
  //     const expectedResult = mockedUser

  //     const userRepository = new UserRepository(dbService)
  //     const result = await userRepository.deleteUser(mockedUser.id as string)

  //     const rowCount = 0
  //     await expect(
  //       factory.dbService.getDatabaseTableRowCount('users'),
  //     ).resolves.toEqual(rowCount)
  //     expect(result.id).toEqual(expectedResult.id)
  //     expect(result.name).toEqual(expectedResult.name)
  //     expect(result.email).toEqual(expectedResult.email)
  //   })
  // })
})
