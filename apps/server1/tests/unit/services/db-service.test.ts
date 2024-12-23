import * as schemas from '@db/schemas'
import { faker } from '@faker-js/faker'
// import { migrate } from 'drizzle-orm/postgres-js/migrator'
import httpStatus from 'http-status'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { DBService } from '../../../src/services'
import {
  startDatabaseContainer,
  config,
  stopDatabaseContainer,
} from '../../test-helpers'
import { ServerError } from '../../../src/server-error'
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { sql } from 'drizzle-orm'
import { PgDatabase } from 'drizzle-orm/pg-core'
import path from 'path'
import { fileURLToPath } from 'url'
import { UserFactory } from '../../factories/user-factory'
import { User, UserMapper } from '../../../src/api/components/user'
import { UserModel } from '../../../db/schemas'

// const actualMigrator = await vi.importActual<
//   typeof import('drizzle-orm/postgres-js/migrator')
// >('drizzle-orm/postgres-js/migrator')

// vi.mock('drizzle-orm/postgres-js/migrator', async () => {
//   const actual = await vi.importActual<
//     typeof import('drizzle-orm/postgres-js/migrator')
//   >('drizzle-orm/postgres-js/migrator')
//   return {
//     ...actual,
//     migrate: vi.fn(),
//   }
// })

describe('DBService', () => {
  let dbService = new DBService()
  let container: StartedPostgreSqlContainer
  // const mockedMigrate = vi.mocked(migrate)
  const currentPath = fileURLToPath(import.meta.url)
  const appPath = path.resolve(currentPath, '..', '..', '..', '..')
  const userFactory = new UserFactory()
  const userMapper = new UserMapper()
  const timeout = 60000

  beforeAll(async () => {
    container = await startDatabaseContainer(config)
  }, timeout)

  beforeEach(async () => {
    dbService = new DBService()
    // mockedMigrate.mockImplementation(actualMigrator.migrate)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await stopDatabaseContainer(container)
  }, timeout)

  describe('.db', () => {
    it('should succeed and return db', async () => {
      dbService.connectDatabase(config.getDatabaseURL())

      const result = dbService.db

      expect(result).not.toBe(null)
      expect(typeof dbService.db).toBe('object')

      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when database is null', () => {
      const message = 'Database is null'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => dbService.db).toThrowError(serverError)
    })
  })

  describe('.connectDatabase', () => {
    it('should define a function', () => {
      expect(typeof dbService.connectDatabase).toBe('function')
    })

    it('should succeed and return undefined when database is created', async () => {
      const expectedResult = undefined

      const result = dbService.connectDatabase(config.getDatabaseURL())

      expect(result).toEqual(expectedResult)
      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when database URL is invalid', () => {
      const databaseURL = faker.string.uuid()
      const error = new TypeError('Invalid URL')
      const message = 'An error occurred when connecting database'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
        {
          context: databaseURL,
          cause: error,
        },
      )

      try {
        dbService.connectDatabase(databaseURL)
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
    })
  })

  describe('.checkDatabaseIsAlive', () => {
    it('should define a function', () => {
      expect(typeof dbService.checkDatabaseIsAlive).toBe('function')
    })

    it('should succeed and return true when database is alive', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const expectedResult = true

      const result = await dbService.checkDatabaseIsAlive()

      expect(result).toEqual(expectedResult)
      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when transaction is not executed', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const error = new Error('failed')
      vi.spyOn(PgDatabase.prototype, 'execute').mockRejectedValue(error)
      const message = 'An error occurred when checking database is alive'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await dbService.checkDatabaseIsAlive()
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
      await dbService.deactivateDatabase()
    })
  })

  describe('.migrateDatabase', () => {
    it('should define a function', () => {
      expect(typeof dbService.migrateDatabase).toBe('function')
    })

    it('should succeed and return undefined when database is migrated', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
      const expectedResult = undefined

      const result = await dbService.migrateDatabase(migrationsFolder)

      expect(result).toEqual(expectedResult)
      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      await dbService.deleteDatabaseTables()
      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when migration folder is invalid', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const migrationsFolder = faker.string.sample()
      const message = 'An error occurred when migrating the database'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await dbService.migrateDatabase(migrationsFolder)
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
      await dbService.deactivateDatabase()
    })
  })

  describe('.getDatabaseTableRowCount', () => {
    it('should define a function', () => {
      expect(typeof dbService.getDatabaseTableRowCount).toBe('function')
    })

    it('should succeed and return number of database table rows', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
      await dbService.migrateDatabase(migrationsFolder)
      const tableName = 'users'
      const count = 3
      const mockedUserList: UserModel[] = userFactory.buildBatch(count)
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
      const expectedResult = count

      const result = await dbService.getDatabaseTableRowCount(tableName)

      expect(result).toEqual(expectedResult)
      await dbService.deleteDatabaseTables()
      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when database table does not exist', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
      await dbService.migrateDatabase(migrationsFolder)
      const tableName = faker.string.sample()
      const message = `An error occurred when counting rows of database table ${tableName}`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await dbService.getDatabaseTableRowCount(tableName)
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
      await dbService.deleteDatabaseTables()
      await dbService.deactivateDatabase()
    })
  })

  describe('.clearDatabaseTables', () => {
    it('should define a function', () => {
      expect(typeof dbService.clearDatabaseTables).toBe('function')
    })

    it('should succeed and return undefined when database tables are cleaned', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
      await dbService.migrateDatabase(migrationsFolder)
      const tableName = 'users'
      const count = 3
      const mockedUserList: UserModel[] = userFactory.buildBatch(count)
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
      await expect(
        dbService.getDatabaseTableRowCount(tableName),
      ).resolves.toEqual(count)
      const expectedResult = 0

      const result = await dbService.clearDatabaseTables()

      expect(result).toEqual(undefined)
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(expectedResult)
      await dbService.deleteDatabaseTables()
      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when transaction is not executed', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const error = new Error('failed')
      vi.spyOn(PgDatabase.prototype, 'execute').mockRejectedValue(error)
      const message = 'An error occurred when cleaning the database tables'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await dbService.clearDatabaseTables()
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
      await dbService.deactivateDatabase()
    })
  })

  describe('.deleteDatabaseTables', () => {
    it('should define a function', () => {
      expect(typeof dbService.deleteDatabaseTables).toBe('function')
    })

    it('should succeed and return undefined when database tables are deleted', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const migrationsFolder = path.join(appPath, 'db', 'migrations')
      await dbService.migrateDatabase(migrationsFolder)

      let result = await dbService.deleteDatabaseTables()

      expect(result).toEqual(undefined)
      const query = sql.raw(`
          SELECT table_name
          FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE';
        `)
      const database_tables = await dbService.db.execute(query)
      expect(database_tables.length).toEqual(0)
      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when transaction is not executed', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const error = new Error('failed')
      vi.spyOn(PgDatabase.prototype, 'execute').mockRejectedValue(error)
      const message = 'An error occurred when deleting the database tables'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await dbService.deleteDatabaseTables()
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
      await dbService.deactivateDatabase()
    })
  })

  describe('.deactivateDatabase', () => {
    it('should define a function', () => {
      expect(typeof dbService.deactivateDatabase).toBe('function')
    })

    it('should succeed and return undefined when database is deactivated', async () => {
      dbService.connectDatabase(config.getDatabaseURL())

      const result = await dbService.deactivateDatabase()

      expect(result).toEqual(undefined)
    })

    it('should fail and throw exception when database is not connected', async () => {
      const message = 'An error occurred when deactivating the database'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      try {
        await dbService.deactivateDatabase()
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
    })
  })
})
