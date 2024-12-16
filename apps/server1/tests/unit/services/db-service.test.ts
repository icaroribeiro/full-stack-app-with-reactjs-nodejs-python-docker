import * as schemas from '@db/schemas'
import { faker } from '@faker-js/faker'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
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
import { DrizzleError, sql } from 'drizzle-orm'
import { PgDatabase } from 'drizzle-orm/pg-core'
import path from 'path'
import { fileURLToPath } from 'url'
import { UserFactory } from '../../factories/user-factory'
import { User, UserMapper } from '../../../src/api/components/user'
import { UserModel } from '../../../db/schemas'
import postgres from 'postgres'

const actualMigrator = await vi.importActual<
  typeof import('drizzle-orm/postgres-js/migrator')
>('drizzle-orm/postgres-js/migrator')

vi.mock('drizzle-orm/postgres-js/migrator', async () => {
  const actual = await vi.importActual<
    typeof import('drizzle-orm/postgres-js/migrator')
  >('drizzle-orm/postgres-js/migrator')
  return {
    ...actual,
    migrate: vi.fn(),
  }
})

// // const actualPostgres =
// //   await vi.importActual<typeof import('postgres')>('postgres')

vi.mock('postgres', async () => {
  const actual = await vi.importActual<typeof import('postgres')>('postgres')
  return {
    ...actual,
    postgres: vi.fn(),
  }
})

describe('DBService', () => {
  let dbService = new DBService()
  let container: StartedPostgreSqlContainer
  const beforeAllTimeout = 30000
  const mockedMigrate = vi.mocked(migrate)
  const currentPath = fileURLToPath(import.meta.url)
  const appPath = path.resolve(currentPath, '..', '..', '..', '..')
  const userFactory = new UserFactory()
  const userMapper = new UserMapper()
  const mockedPostgres = vi.mocked(postgres)

  beforeAll(async () => {
    container = await startDatabaseContainer(config)
  }, beforeAllTimeout)

  beforeEach(() => {
    dbService = new DBService()
    mockedMigrate.mockImplementation(actualMigrator.migrate)
    mockedPostgres.prototype.end = vi.fn()
    // vi.spyOn(postgres.Sql<{}>, 'end').mockRejectedValue(
    //   new Error(),
    // )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await stopDatabaseContainer(container)
  })

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

    it('should succeed and return undefined when db is created', async () => {
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

      expect(() => dbService.connectDatabase(databaseURL)).toThrowError(
        serverError,
      )
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

    it('should fail and throw exception when pg database execute method fails', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const error = new Error('failed')
      vi.spyOn(PgDatabase.prototype, 'execute').mockRejectedValue(error)

      expect(() => dbService.checkDatabaseIsAlive()).rejects.toThrowError(
        new DrizzleError({ message: 'Rollback' }),
      )
      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when db is null', () => {
      const message = 'Database is null'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => dbService.checkDatabaseIsAlive()).rejects.toThrowError(
        serverError,
      )
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

    it('should fail and throw exception when database is null', async () => {
      const migrationsFolder = faker.string.sample()
      const message = 'Database is null'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() =>
        dbService.migrateDatabase(migrationsFolder),
      ).rejects.toThrowError(serverError)
    })

    it('should fail and throw exception when migration fails', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const error = new Error('failed')
      mockedMigrate.mockRejectedValue(error)
      const migrationsFolder = faker.string.sample()
      const message = 'An error occurred when migrating the database'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() =>
        dbService.migrateDatabase(migrationsFolder),
      ).rejects.toThrowError(serverError)
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

    it('should fail and throw exception when pg database execute method fails', async () => {
      dbService.connectDatabase(config.getDatabaseURL())
      const error = new Error('failed')
      vi.spyOn(PgDatabase.prototype, 'execute').mockRejectedValue(error)
      const tableName = faker.string.sample()

      expect(() =>
        dbService.getDatabaseTableRowCount(tableName),
      ).rejects.toThrowError(new DrizzleError({ message: 'Rollback' }))
      await dbService.deactivateDatabase()
    })

    it('should fail and throw exception when database is null', () => {
      const tableName = 'users'
      const message = 'Database is null'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() =>
        dbService.getDatabaseTableRowCount(tableName),
      ).rejects.toThrowError(serverError)
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

      it('should fail and throw exception when pg database execute method fails', async () => {
        dbService.connectDatabase(config.getDatabaseURL())
        const error = new Error('failed')
        vi.spyOn(PgDatabase.prototype, 'execute').mockRejectedValue(error)

        expect(() => dbService.clearDatabaseTables()).rejects.toThrowError(
          new DrizzleError({ message: 'Rollback' }),
        )
        await dbService.deactivateDatabase()
      })

      it('should fail and throw exception when database is null', () => {
        const message = 'Database is null'
        const serverError = new ServerError(
          message,
          httpStatus.INTERNAL_SERVER_ERROR,
        )

        expect(() => dbService.clearDatabaseTables()).rejects.toThrowError(
          serverError,
        )
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
        await dbService.deleteDatabaseTables()
        await dbService.deactivateDatabase()
      })

      it('should fail and throw exception when pg database execute method fails', async () => {
        dbService.connectDatabase(config.getDatabaseURL())
        const error = new Error('failed')
        vi.spyOn(PgDatabase.prototype, 'execute').mockRejectedValue(error)

        expect(() => dbService.deleteDatabaseTables()).rejects.toThrowError(
          new DrizzleError({ message: 'Rollback' }),
        )
        await dbService.deactivateDatabase()
      })

      it('should fail and throw exception when database is null', () => {
        const message = 'Database is null'
        const serverError = new ServerError(
          message,
          httpStatus.INTERNAL_SERVER_ERROR,
        )

        expect(() => dbService.deleteDatabaseTables()).rejects.toThrowError(
          serverError,
        )
      })
    })

    describe('.deactivateDatabase', () => {
      it('should define a function', () => {
        expect(typeof dbService.deactivateDatabase).toBe('function')
      })

      it('should succeed and return undefined when database is deactivated', async () => {
        dbService.connectDatabase(config.getDatabaseURL())
        const migrationsFolder = path.join(appPath, 'db', 'migrations')
        await dbService.migrateDatabase(migrationsFolder)

        const result = await dbService.deactivateDatabase()

        expect(result).toEqual(undefined)
      })

      // it('should fail and throw exception when database client end method fails', async () => {
      //   dbService.connectDatabase(config.getDatabaseURL())
      //   const error = new Error('failed')
      //   mockedPostgres.prototype.end = vi.fn().mockImplementation(() => 10)
      //   const message = 'An error occurred when deactivating the database'
      //   const serverError = new ServerError(
      //     message,
      //     httpStatus.INTERNAL_SERVER_ERROR,
      //   )

      //   expect(() => dbService.deactivateDatabase()).rejects.toThrowError(
      //     serverError,
      //   )
      // })

      it('should fail and throw exception when database client is null', () => {
        const message = 'Database client is null'
        const serverError = new ServerError(
          message,
          httpStatus.INTERNAL_SERVER_ERROR,
        )

        expect(() => dbService.deactivateDatabase()).rejects.toThrowError(
          serverError,
        )
      })
    })
  })
})
