import * as schemas from '@db/schemas'
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
import { DrizzleError } from 'drizzle-orm'
import path from 'path'
import { fileURLToPath } from 'url'

const currentPath = fileURLToPath(import.meta.url)
const appPath = path.resolve(currentPath, '..', '..', '..', '..', '..', '..')
const migrationsFolder = path.join(appPath, 'db', 'migrations')

describe('UserRepository', async () => {
  const userRepository = new UserRepository(dbService)
  const userFactory = new UserFactory()
  const userMapper = new UserMapper()
  let container: StartedPostgreSqlContainer
  const beforeAllTimeout = 30000

  beforeAll(async () => {
    container = await startDatabaseContainer(config)
    dbService.connectDatabase(config.getDatabaseURL())
  }, beforeAllTimeout)

  beforeEach(async () => {
    await dbService.clearDatabaseTables()
    await dbService.deleteDatabaseTables()
  })

  afterAll(async () => {
    await dbService.deactivateDatabase()
    await stopDatabaseContainer(container)
  })

  describe('.createUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.createUser).toBe('function')
    })

    it('should succeed and return user when user is created', async () => {
      await dbService.migrateDatabase(migrationsFolder)
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

    it('should fail and throw exception when user schema does not exist into database', async () => {
      const mockedUser = userFactory.build()

      expect(() => userRepository.createUser(mockedUser)).rejects.toThrowError(
        new DrizzleError({ message: 'Rollback' }),
      )
    })
  })

  describe('.readAndCountUsers', () => {
    it('should define a function', () => {
      expect(typeof userRepository.readAndCountUsers).toBe('function')
    })

    it('should succeed and return an empty list of users with zero total when users do not exist', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const page = faker.number.int({ min: 1, max: 3 })
      const limit = faker.number.int({ min: 1, max: 3 })
      const expectedRecordsResult: User[] = []
      const expectedTotalResult = 0

      const [recordsResult, totalResult] =
        await userRepository.readAndCountUsers(page, limit)

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(recordsResult).toEqual(expectedRecordsResult)
      expect(totalResult).toEqual(expectedTotalResult)
    })

    // it('should succeed and return a list of users with non-zero total when page is the first one and can be filled', async () => {
    //   const count = 3
    //   const mockedUserList: UserList = userFactory.buildMany(count)
    //   for (const mockedUser of mockedUserList) {
    //     const rawUserData = UserMapper.toPersistence(mockedUser)
    //     const insertedUser = await dbService.db
    //       .insert(schemas.usersTable)
    //       .values(rawUserData)
    //       .returning()
    //     mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
    //   }
    //   const page = 1
    //   const limit = 1
    //   const expectedPaginatedRecordsResult: UserList = [
    //     mockedUserList[mockedUserList.length - 1],
    //   ]
    //   const expectedTotalRecordsResult = 3

    //   const userRepository = new UserRepository(dbService)
    //   const [paginatedRecordsResult, totalRecordsResult] =
    //     await userRepository.readAndCountUsers(page, limit)

    //   const rowCount = 3
    //   await expect(
    //     factory.dbService.getDatabaseTableRowCount('users'),
    //   ).resolves.toEqual(rowCount)
    //   expect(paginatedRecordsResult).toEqual(expectedPaginatedRecordsResult)
    //   expect(totalRecordsResult).toEqual(expectedTotalRecordsResult)
    // })

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

    it('should fail and throw exception when user schema does not exist into database', async () => {
      const page = faker.number.int({ min: 1, max: 3 })
      const limit = faker.number.int({ min: 1, max: 3 })

      expect(() =>
        userRepository.readAndCountUsers(page, limit),
      ).rejects.toThrowError(new DrizzleError({ message: 'Rollback' }))
    })
  })

  describe('.readUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.readUser).toBe('function')
    })

    it('should succeed and return a user when user is read', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userFactory.build()
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

    it('should fail and throw exception when user schema does not exist into database', async () => {
      const mockedUser = userFactory.build()

      expect(() => userRepository.readUser(mockedUser.id)).rejects.toThrowError(
        new DrizzleError({ message: 'Rollback' }),
      )
    })
  })

  describe('.updateUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.updateUser).toBe('function')
    })

    it('should succeed and return a user when user is updated', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userFactory.build()
      const rawUserData = userMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.userSchema)
        .values(rawUserData)
        .returning()
      const domainUser = insertedUser.map((u) => userMapper.toDomain(u))[0]
      const mockedUpdatedUser = userMapper.toDomain(userFactory.build())
      mockedUpdatedUser.id = domainUser.id
      mockedUpdatedUser.createdAt = domainUser.createdAt
      const expectedResult = mockedUpdatedUser

      const result = await userRepository.updateUser(
        mockedUpdatedUser.id as string,
        mockedUpdatedUser,
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

    it('should fail and throw exception when user schema does not exist into database', async () => {
      const mockedUpdatedUser = userMapper.toDomain(userFactory.build())

      expect(() =>
        userRepository.updateUser(
          mockedUpdatedUser.id as string,
          mockedUpdatedUser,
        ),
      ).rejects.toThrowError(new DrizzleError({ message: 'Rollback' }))
    })
  })

  describe('.deleteUser', () => {
    it('should define a function', () => {
      expect(typeof userRepository.deleteUser).toBe('function')
    })

    it('should succeed and return user when user is deleted', async () => {
      await dbService.migrateDatabase(migrationsFolder)
      const mockedUser = userFactory.build()
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

  it('should fail and throw exception when user schema does not exist into database', async () => {
    const mockedUser = userMapper.toDomain(userFactory.build())

    expect(() =>
      userRepository.deleteUser(mockedUser.id as string),
    ).rejects.toThrowError(new DrizzleError({ message: 'Rollback' }))
  })
})
