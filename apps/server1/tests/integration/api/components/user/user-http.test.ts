import * as schemas from '@db/schemas'
import httpStatus from 'http-status'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  closeHttpServer,
  config,
  dbService,
  startDatabaseContainer,
  startHttpServer,
  stopDatabaseContainer,
} from '../../../../test-helpers'
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { UserFactory } from '../../../../factories/user-factory'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  User,
  UserMapper,
  UserResponse,
} from '../../../../../src/api/components/user'
import { faker } from '@faker-js/faker'
import { APIErrorResponse } from '../../../../../src/api/shared'

describe('User HTTP', () => {
  const currentPath = fileURLToPath(import.meta.url)
  const appPath = path.resolve(currentPath, '..', '..', '..', '..', '..', '..')
  const migrationsFolder = path.join(appPath, 'db', 'migrations')
  const endpoint = '/users'
  const url = `http://localhost:${config.getPort()}${endpoint}`
  const userFactory = new UserFactory()
  const userMapper = new UserMapper()
  let container: StartedPostgreSqlContainer
  const timeout = 100000

  beforeAll(async () => {
    container = await startDatabaseContainer(config)
    dbService.connectDatabase(config.getDatabaseURL())
    await dbService.migrateDatabase(migrationsFolder)
    startHttpServer(config)
  }, timeout)

  afterEach(async () => {
    await dbService.clearDatabaseTables()
  })

  afterAll(async () => {
    closeHttpServer()
    await dbService.deactivateDatabase()
    await stopDatabaseContainer(container)
  }, timeout)

  describe('POST /users', () => {
    it('should succeed and return 201 status code when user is added', async () => {
      const mockedUser = userFactory.build()
      const userRequest = { name: mockedUser.name, email: mockedUser.email }
      const expectedResponseBody: UserResponse = {
        id: null,
        name: mockedUser.name,
        email: mockedUser.email,
        createdAt: null,
        updatedAt: null,
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userRequest),
      })

      const rowCount = 1
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.CREATED)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(responseBody.name).toEqual(expectedResponseBody.name)
      expect(responseBody.email).toEqual(expectedResponseBody.email)
    })

    it('should fail and return 422 status code when user request email is invalid', async () => {
      const mockedUser = userFactory.build()
      mockedUser.email = faker.word.sample()
      const userRequest = { name: mockedUser.name, email: mockedUser.email }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userRequest),
      })

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY)
      const responseBody = (await response.json()) as APIErrorResponse
      expect(responseBody.isOperational).toEqual(true)
    })
  })

  describe('GET /users', () => {
    it('should succeed and return 200 status code with empty list of users with zero total when users do not exist', async () => {
      const baseURL = url
      const expectedResponseBody = {
        page: 1,
        limit: 1,
        totalPages: 0,
        totalRecords: 0,
        records: [],
      }

      const response = await fetch(baseURL)

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.OK)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(responseBody).toEqual(expectedResponseBody)
    })

    it('should succeed and return 200 status code with list of users with non-zero total when page is the first and can be filled', async () => {
      const count = 3
      const mockedUserList = userFactory.buildBatch(count)
      const domainUserList: User[] = []
      for (const mockedUser of mockedUserList) {
        const rawUserData = userMapper.toPersistence(
          userMapper.toDomain(mockedUser),
        )
        const insertedUser = await dbService.db
          .insert(schemas.userSchema)
          .values(rawUserData)
          .returning()
        domainUserList.push(userMapper.toDomain(insertedUser[0]))
      }
      const page = 1
      const limit = 1
      const baseURL = `${url}?page=${page}&limit=${limit}`
      const next = baseURL.replace(/(page=)[^&]+/, '$1' + `${page + 1}`)
      const expectedResponseBody = {
        page: 1,
        limit: 1,
        totalPages: 3,
        totalRecords: 3,
        records: [
          userMapper.toResponse(domainUserList[domainUserList.length - 1]),
        ],
        next: next,
      }

      const response = await fetch(baseURL)

      const rowCount = 3
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.OK)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(JSON.stringify(responseBody)).toEqual(
        JSON.stringify(expectedResponseBody),
      )
    })

    it('should succeed and return 200 status code with list of users with non-zero total when page is not the first and cannot be filled', async () => {
      const count = 3
      const mockedUserList = userFactory.buildBatch(count)
      const domainUserList: User[] = []
      for (const mockedUser of mockedUserList) {
        const rawUserData = userMapper.toPersistence(
          userMapper.toDomain(mockedUser),
        )
        const insertedUser = await dbService.db
          .insert(schemas.userSchema)
          .values(rawUserData)
          .returning()
        domainUserList.push(userMapper.toDomain(insertedUser[0]))
      }
      const page = 2
      const limit = 3
      const baseURL = `${url}?page=${page}&limit=${limit}`
      const expectedResponseBody = {
        page: 2,
        limit: 3,
        totalPages: 1,
        totalRecords: 3,
        records: [],
      }

      const response = await fetch(baseURL)

      const rowCount = 3
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.OK)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(JSON.stringify(responseBody)).toEqual(
        JSON.stringify(expectedResponseBody),
      )
    })

    it('should succeed and return 200 status code with list of users with non-zero total when page is not the first and can be filled', async () => {
      const count = 5
      const mockedUserList = userFactory.buildBatch(count)
      const domainUserList: User[] = []
      for (const mockedUser of mockedUserList) {
        const rawUserData = userMapper.toPersistence(
          userMapper.toDomain(mockedUser),
        )
        const insertedUser = await dbService.db
          .insert(schemas.userSchema)
          .values(rawUserData)
          .returning()
        domainUserList.push(userMapper.toDomain(insertedUser[0]))
      }
      const page = 3
      const limit = 2
      const baseURL = `${url}?page=${page}&limit=${limit}`
      const previous = baseURL.replace(/(page=)[^&]+/, '$1' + `${page - 1}`)
      const expectedResponseBody = {
        page: 3,
        limit: 2,
        totalPages: 3,
        totalRecords: 5,
        records: [userMapper.toResponse(domainUserList[0])],
        previous: previous,
      }

      const response = await fetch(baseURL)

      const rowCount = 5
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.OK)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(JSON.stringify(responseBody)).toEqual(
        JSON.stringify(expectedResponseBody),
      )
    })
  })

  describe('GET /users/{userId}', () => {
    it('should succeed and return 200 status code when user is fetched', async () => {
      const mockedUser = userFactory.build()
      const rawUserData = userMapper.toPersistence(
        userMapper.toDomain(mockedUser),
      )
      const insertedUser = await dbService.db
        .insert(schemas.userSchema)
        .values(rawUserData)
        .returning()
      const domainUser = userMapper.toDomain(insertedUser[0])
      const expectedResponseBody = userMapper.toResponse(domainUser)

      const response = await fetch(`${url}/${domainUser.id}`)

      const rowCount = 1
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.OK)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(JSON.stringify(responseBody)).toEqual(
        JSON.stringify(expectedResponseBody),
      )
    })

    it('should fail and return response status 404 status code when user is not found', async () => {
      const mockedUser = userFactory.build()

      const response = await fetch(`${url}/${mockedUser.id}`)

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.NOT_FOUND)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(responseBody.isOperational).toEqual(true)
    })
  })

  describe('PUT /users/{userId}', () => {
    it('should succeed and return 200 status code when user is renewed', async () => {
      const mockedUser = userFactory.build()
      const rawUserData = userMapper.toPersistence(
        userMapper.toDomain(mockedUser),
      )
      const insertedUser = await dbService.db
        .insert(schemas.userSchema)
        .values(rawUserData)
        .returning()
      const domainUser = userMapper.toDomain(insertedUser[0])
      const mockedUpdatedUser = userFactory.build()
      mockedUpdatedUser.id = domainUser.id as string
      mockedUpdatedUser.createdAt = domainUser.createdAt as Date
      const userRequest = {
        name: mockedUpdatedUser.name,
        email: mockedUpdatedUser.email,
      }
      const expectedResponseBody = {
        name: mockedUpdatedUser.name,
        email: mockedUpdatedUser.email,
      }

      const response = await fetch(`${url}/${domainUser.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userRequest),
      })

      const rowCount = 1
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.OK)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(responseBody.id).toEqual(domainUser.id)
      expect(responseBody.name).toEqual(expectedResponseBody.name)
      expect(responseBody.email).toEqual(expectedResponseBody.email)
      expect(responseBody.createdAt).toEqual(
        domainUser.createdAt?.toISOString(),
      )
      expect(responseBody.updatedAt).not.toBe(null)
    })

    it('should fail and return 404 status code when user is not found', async () => {
      const mockedUser = userFactory.build()
      const userRequest = {
        name: mockedUser.name,
        email: mockedUser.email,
      }

      const response = await fetch(`${url}/${mockedUser.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userRequest),
      })

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.NOT_FOUND)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(responseBody.isOperational).toEqual(true)
    })

    it('should fail and return 422 status code when user request email is invalid', async () => {
      const mockedUser = userFactory.build()
      mockedUser.email = faker.word.sample()
      const userRequest = { name: mockedUser.name, email: mockedUser.email }

      const response = await fetch(`${url}/${mockedUser.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userRequest),
      })

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(responseBody.isOperational).toEqual(true)
    })
  })

  describe('DELETE  /users/{userId}', () => {
    it('should succeed and return 200 status code when user is deleted', async () => {
      const mockedUser = userFactory.build()
      const rawUserData = userMapper.toPersistence(
        userMapper.toDomain(mockedUser),
      )
      const insertedUser = await dbService.db
        .insert(schemas.userSchema)
        .values(rawUserData)
        .returning()
      const domainUser = userMapper.toDomain(insertedUser[0])
      const expectedResponseBody = userMapper.toResponse(domainUser)

      const response = await fetch(`${url}/${domainUser.id}`, {
        method: 'DELETE',
      })

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.OK)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(JSON.stringify(responseBody)).toEqual(
        JSON.stringify(expectedResponseBody),
      )
    })

    it('should fail and return response status 404 status code when user is not found', async () => {
      const mockedUser = userFactory.build()

      const response = await fetch(`${url}/${mockedUser.id}`, {
        method: 'DELETE',
      })

      const rowCount = 0
      await expect(
        dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(httpStatus.NOT_FOUND)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(responseBody.isOperational).toEqual(true)
    })
  })
})
