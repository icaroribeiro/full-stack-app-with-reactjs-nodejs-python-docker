import * as schemas from '@db/schemas'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { UserFactory } from '../../../../factories/helpers/user-factory'
import { RepositoryTestFactory } from '../../../../factories/repository-factory'
import { DBService } from '../../../../services'
import { UserMapper } from '../user-mapper'
import { User, UserList } from '../user-models'
import { UserRepository } from '../user-repository'
describe('UserRepository', async () => {
  const factory: RepositoryTestFactory = new RepositoryTestFactory()
  const userFactory = new UserFactory()

  let dbService: DBService
  beforeAll(async () => {
    await factory.prepareAll()
    dbService = factory.dbService
  }, factory.beforeAllTimeout)

  afterEach(async () => {
    await factory.closeEach()
  })

  afterAll(async () => {
    await factory.closeAll()
  })

  describe('.createUser', () => {
    it('should define a function', () => {
      const userRepository = new UserRepository(dbService)

      expect(typeof userRepository.createUser).toBe('function')
    })

    it('should succeed and return a created user', async () => {
      const mockedUser: User = userFactory.build()
      const expectedResult = mockedUser

      const userRepository = new UserRepository(dbService)
      const result = await userRepository.createUser(mockedUser)

      const rowCount = 1
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result.id).not.toBeUndefined()
      expect(result.name).toEqual(expectedResult.name)
      expect(result.email).toEqual(expectedResult.email)
    })
  })

  describe('.readUserList', () => {
    it('should define a function', () => {
      const userRepository = new UserRepository(dbService)

      expect(typeof userRepository.readUserList).toBe('function')
    })

    it('should succeed and return an empty list', async () => {
      const userRepository = new UserRepository(dbService)
      const result = await userRepository.readUserList()

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).toHaveLength(0)
    })

    it('should succeed and return a list of users', async () => {
      const count = 3
      const mockedUserList: UserList = userFactory.buildMany(count)
      for (const mockedUser of mockedUserList) {
        const rawUserData = UserMapper.toPersistence(mockedUser)
        const insertedUser = await dbService.db
          .insert(schemas.usersTable)
          .values(rawUserData)
          .returning()
        mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
      }
      const expectedResult = mockedUserList

      const userRepository = new UserRepository(dbService)
      const result = await userRepository.readUserList()

      const rowCount = 3
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(new Set(result)).toEqual(new Set(expectedResult))
    })
  })

  describe('.readUser', () => {
    it('should define a function', () => {
      const userRepository = new UserRepository(dbService)

      expect(typeof userRepository.readUser).toBe('function')
    })

    it('should succeed and return undefined', async () => {
      const mockedUser: User = userFactory.build()

      const userRepository = new UserRepository(dbService)
      const result = await userRepository.readUser(mockedUser.id as string)

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).toBeUndefined()
    })

    it('should succeed and return a user', async () => {
      const mockedUser: User = userFactory.build()
      const rawUserData = UserMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.usersTable)
        .values(rawUserData)
        .returning()
      mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
      const expectedResult = mockedUser

      const userRepository = new UserRepository(dbService)
      const result = await userRepository.readUser(mockedUser.id as string)

      const rowCount = 1
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result.id).toEqual(expectedResult.id)
      expect(result.name).toEqual(expectedResult.name)
      expect(result.email).toEqual(expectedResult.email)
    })
  })

  describe('.updateUser', () => {
    it('should define a function', () => {
      const userRepository = new UserRepository(dbService)

      expect(typeof userRepository.updateUser).toBe('function')
    })

    it('should succeed and return undefined', async () => {
      const mockedUser: User = userFactory.build()
      const mockedUpdatedUser: User = userFactory.build()

      const userRepository = new UserRepository(dbService)
      const result = await userRepository.updateUser(
        mockedUser.id as string,
        mockedUpdatedUser,
      )

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).toBeUndefined()
    })

    it('should succeed and return an updated user', async () => {
      const mockedUser: User = userFactory.build()
      const rawUserData = UserMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.usersTable)
        .values(rawUserData)
        .returning()
      mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
      const mockedUpdatedUser: User = userFactory.build()
      mockedUpdatedUser.id = mockedUser.id
      const expectedResult = mockedUpdatedUser

      const userRepository = new UserRepository(dbService)
      const result = await userRepository.updateUser(
        mockedUser.id as string,
        mockedUpdatedUser,
      )

      const rowCount = 1
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result.id).toEqual(expectedResult.id)
      expect(result.name).toEqual(expectedResult.name)
      expect(result.email).toEqual(expectedResult.email)
    })
  })

  describe('.deleteUser', () => {
    it('should define a function', () => {
      const userRepository = new UserRepository(dbService)

      expect(typeof userRepository.deleteUser).toBe('function')
    })

    it('should succeed and return undefined', async () => {
      const mockedUser: User = userFactory.build()

      const userRepository = new UserRepository(dbService)
      const result = await userRepository.deleteUser(mockedUser.id as string)

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result).toBeUndefined()
    })

    it('should succeed and return a deleted user', async () => {
      const mockedUser: User = userFactory.build()
      const rawUserData = UserMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.usersTable)
        .values(rawUserData)
        .returning()
      mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
      const expectedResult = mockedUser

      const userRepository = new UserRepository(dbService)
      const result = await userRepository.deleteUser(mockedUser.id as string)

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(result.id).toEqual(expectedResult.id)
      expect(result.name).toEqual(expectedResult.name)
      expect(result.email).toEqual(expectedResult.email)
    })
  })
})
