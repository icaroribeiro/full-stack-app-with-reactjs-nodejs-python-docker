// import * as schemas from '@db/schemas'
// import { faker } from '@faker-js/faker'
// import { migrate } from 'drizzle-orm/postgres-js/migrator'
// import { INTERNAL_SERVER_ERROR } from 'http-status'
// import path from 'path'
import httpStatus from 'http-status'
// import { fileURLToPath } from 'url'
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
import { Config } from '../../../src/config/config'
import {
  startDatabaseContainer,
  finalizeDatabase,
  initializeDatabase,
} from '../../test-helpers'
import exp from 'constants'
import { ServerError } from '../../../src/server-error'

// import { UserList, UserMapper } from '../../api/components/user'
// import { ServerError } from '../../server-error'
// import { config } from '../../config/config'
// import { DBContainerTestFactory } from '../../factories/db-container-factory'
// import { UserFactory } from '../../factories/helpers/user-factory'
// import { DBService } from '../db-service'

// const actualModule = await vi.importActual<
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
  const config = new Config()
  let dbService: DBService

  beforeAll(async () => {
    await startDatabaseContainer(config)
  }, 30000)

  beforeEach(() => {
    dbService = new DBService()
  })

  //   const factory: DBContainerTestFactory = new DBContainerTestFactory()
  //   const mockedMigrate = vi.mocked(migrate)
  //   beforeEach(() => {
  //     mockedMigrate.mockImplementation(actualModule.migrate)
  //   })
  //   beforeAll(async () => {
  //     await factory.prepareAll()
  //   }, factory.beforeAllTimeout)
  //   afterEach(async () => {
  //     await factory.closeEach()
  //   })
  //   afterAll(async () => {
  //     await factory.closeAll()
  //   })
  describe('.db', () => {
    it('should succeed and return db', async () => {
      await initializeDatabase(config, dbService)

      const result = dbService.db

      expect(result).not.toBe(null)
      expect(typeof dbService.db).toBe('object')

      await finalizeDatabase(dbService)
    })

    it('should fail and throw exception when database is null', () => {
      const message = 'Database is null!'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => dbService.db).toThrowError(serverError)
    })
  })

  //   describe('.connectDatabase', () => {
  //     it('should define a function', () => {
  //       const dbService = new DBService()
  //       expect(typeof dbService.connectDatabase).toBe('function')
  //     })
  //     it('should succeed and return undefined', () => {
  //       const expectedResult = undefined
  //       const dbService = new DBService()
  //       const result = dbService.connectDatabase(config.getDatabaseURL())
  //       expect(result).toEqual(expectedResult)
  //     })
  //     it('should fail and throw exception when database URL is invalid', () => {
  //       const databaseURL = faker.string.uuid()
  //       const error = new TypeError('Invalid URL')
  //       const message = 'Database connection failed!'
  //       const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
  //         context: databaseURL,
  //         cause: error,
  //       })
  //       const dbService = new DBService()
  //       expect(() => dbService.connectDatabase(databaseURL)).toThrowError(
  //         serverError,
  //       )
  //     })
  //   })
  //   describe('.checkDatabaseIsAlive', () => {
  //     it('should define a function', () => {
  //       const dbService = new DBService()
  //       expect(typeof dbService.checkDatabaseIsAlive).toBe('function')
  //     })
  //     it('should succeed and return true', () => {
  //       const expectedResult = true
  //       const dbService = new DBService()
  //       dbService.connectDatabase(config.getDatabaseURL())
  //       const result = dbService.checkDatabaseIsAlive()
  //       expect(result).toEqual(expectedResult)
  //     })
  //     it('should fail and throw exception when db is undefined', () => {
  //       const message = 'DB is undefined!'
  //       const serverError = new ServerError(message, INTERNAL_SERVER_ERROR)
  //       const dbService = new DBService()
  //       expect(() => dbService.checkDatabaseIsAlive()).toThrowError(serverError)
  //     })
  //   })
  //   describe('.migrateDatabase', () => {
  //     it('should define a function', () => {
  //       const dbService = new DBService()
  //       expect(typeof dbService.migrateDatabase).toBe('function')
  //     })
  //     it('should succeed and configure all database tables', async () => {
  //       const currentPath = fileURLToPath(import.meta.url)
  //       const appPath = path.resolve(currentPath, '..', '..', '..', '..')
  //       const migrationsFolder = path.join(appPath, 'db', 'migrations')
  //       const expectedResult = undefined
  //       const dbService = new DBService()
  //       dbService.connectDatabase(config.getDatabaseURL())
  //       const result = await dbService.migrateDatabase(migrationsFolder)
  //       expect(result).toEqual(expectedResult)
  //       const rowCount = 0
  //       await expect(
  //         dbService.getDatabaseTableRowCount('users'),
  //       ).resolves.toEqual(rowCount)
  //     })
  //     it('should fail and throw exception when database migration client is undefined', () => {
  //       const migrationsFolder = faker.string.sample()
  //       const message = 'Database migration client is undefined!'
  //       const serverError = new ServerError(message, INTERNAL_SERVER_ERROR)
  //       const dbService = new DBService()
  //       expect(() =>
  //         dbService.migrateDatabase(migrationsFolder),
  //       ).rejects.toThrowError(serverError)
  //     })
  //     it('should fail and throw exception when migration fails', () => {
  //       const migrationsFolder = faker.string.sample()
  //       mockedMigrate.mockRejectedValue(new Error('failed'))
  //       const message = 'Database migrations failed!'
  //       const serverError = new ServerError(message, INTERNAL_SERVER_ERROR)
  //       const dbService = new DBService()
  //       dbService.connectDatabase(config.getDatabaseURL())
  //       expect(() =>
  //         dbService.migrateDatabase(migrationsFolder),
  //       ).rejects.toThrowError(serverError)
  //     })
  //   })
  //   describe('.getDatabaseTableRowCount', () => {
  //     const userFactory = new UserFactory.build()
  //     it('should define a function', () => {
  //       const dbService = new DBService()
  //       expect(typeof dbService.getDatabaseTableRowCount).toBe('function')
  //     })
  //     it('should succeed and return three', async () => {
  //       const currentPath = fileURLToPath(import.meta.url)
  //       const appPath = path.resolve(currentPath, '..', '..', '..', '..')
  //       const migrationsFolder = path.join(appPath, 'db', 'migrations')
  //       const dbService = new DBService()
  //       dbService.connectDatabase(config.getDatabaseURL())
  //       await dbService.migrateDatabase(migrationsFolder)
  //       const count = 3
  //       const mockedUserList: UserList = userFactory.buildMany(count)
  //       for (const mockedUser of mockedUserList) {
  //         const rawUserData = UserMapper.toPersistence(mockedUser)
  //         const insertedUser = await dbService.db
  //           .insert(schemas.userSchema)
  //           .values(rawUserData)
  //           .returning()
  //         mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
  //       }
  //       const expectedResult = count
  //       const result = await dbService.getDatabaseTableRowCount('users')
  //       expect(result).toEqual(expectedResult)
  //       await dbService.db.delete(schemas.userSchema)
  //     })
  //     it('should fail and throw exception when db is undefined', () => {
  //       const message = 'DB is undefined!'
  //       const serverError = new ServerError(message, INTERNAL_SERVER_ERROR)
  //       const dbService = new DBService()
  //       expect(() =>
  //         dbService.getDatabaseTableRowCount('users'),
  //       ).rejects.toThrowError(serverError)
  //     })
  //   })
  //   describe('.clearDatabaseTables', () => {
  //     const userFactory = new UserFactory.build()
  //     it('should define a function', () => {
  //       const dbService = new DBService()
  //       expect(typeof dbService.clearDatabaseTables).toBe('function')
  //     })
  //     it('should succeed and remove all records of all database tables', async () => {
  //       const currentPath = fileURLToPath(import.meta.url)
  //       const appPath = path.resolve(currentPath, '..', '..', '..', '..')
  //       const migrationsFolder = path.join(appPath, 'db', 'migrations')
  //       const dbService = new DBService()
  //       dbService.connectDatabase(config.getDatabaseURL())
  //       await dbService.migrateDatabase(migrationsFolder)
  //       const count = 3
  //       const mockedUserList: UserList = userFactory.buildMany(count)
  //       for (const mockedUser of mockedUserList) {
  //         const rawUserData = UserMapper.toPersistence(mockedUser)
  //         const insertedUser = await dbService.db
  //           .insert(schemas.userSchema)
  //           .values(rawUserData)
  //           .returning()
  //         mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
  //       }
  //       const rowCount = count
  //       await expect(
  //         dbService.getDatabaseTableRowCount('users'),
  //       ).resolves.toEqual(rowCount)
  //       const expectedResult = 0
  //       const result = await dbService.clearDatabaseTables()
  //       expect(result).toEqual(undefined)
  //       await expect(
  //         dbService.getDatabaseTableRowCount('users'),
  //       ).resolves.toEqual(expectedResult)
  //     })
  //     it('should fail and throw exception when db is undefined', () => {
  //       const message = 'DB is undefined!'
  //       const serverError = new ServerError(message, INTERNAL_SERVER_ERROR)
  //       const dbService = new DBService()
  //       expect(() => dbService.clearDatabaseTables()).rejects.toThrowError(
  //         serverError,
  //       )
  //     })
  //   })
})
