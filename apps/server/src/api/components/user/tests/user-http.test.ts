import * as schemas from '@db/schemas'
import { CREATED, NOT_FOUND, OK } from 'http-status'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
} from 'vitest'

import { config } from '../../../../config/config'
import { UserFactory } from '../../../../factories/helpers/user-factory'
import { HttpTestFactory } from '../../../../factories/http-factory'
import { DBService } from '../../../../services'
import { UserMapper } from '../user-mapper'
import { User, UserList } from '../user-models'

describe('User HTTP component', () => {
  const factory: HttpTestFactory = new HttpTestFactory()
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

  describe('POST /users', () => {
    const endpoint = '/users'
    const url = `http://localhost:${config.getPort()}${endpoint}`
    let response: Response
    let body: Record<string, unknown>

    it('should succeed and return a user', async () => {
      const mockedUser: User = userFactory.build()
      mockedUser.id = undefined
      const expectedResult = mockedUser

      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockedUser),
      })
      body = (await response.json()) as Record<string, unknown>

      const rowCount = 1
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(CREATED)
      expect(body).to.be.an('object')
      expect(body.name).toEqual(expectedResult.name)
      expect(body.email).toEqual(expectedResult.email)
    })
  })

  describe('GET /users', () => {
    const endpoint = '/users'
    const url = `http://localhost:${config.getPort()}${endpoint}`
    let response: Response
    let body: Array<Record<string, unknown>>

    it('should succeed and return an empty list', async () => {
      response = await fetch(url)
      body = (await response.json()) as Array<Record<string, unknown>>

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(OK)
      expectTypeOf(body).toBeArray()
      expect(body).toHaveLength(0)
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

      response = await fetch(url)
      body = (await response.json()) as Array<Record<string, unknown>>

      const rowCount = 3
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(OK)
      expectTypeOf(body).toBeArray()
      expect(body).toHaveLength(3)
      expect(new Set(body.map((u) => UserMapper.toDomain(u)))).toEqual(
        new Set(expectedResult),
      )
    })
  })

  describe('GET /users/{userId}', () => {
    const endpoint = '/users'
    const url = `http://localhost:${config.getPort()}${endpoint}`
    let response: Response
    let body: Record<string, unknown>

    it('should succeed and return a user', async () => {
      const mockedUser: User = userFactory.build()
      const rawUserData = UserMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.usersTable)
        .values(rawUserData)
        .returning()
      mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
      const expectedResult = mockedUser

      response = await fetch(`${url}/${mockedUser.id}`)
      body = (await response.json()) as Record<string, unknown>

      const rowCount = 1
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(OK)
      expect(body).to.be.an('object')
      expect(body.id).not.toBeUndefined()
      expect(body.name).toEqual(expectedResult.name)
      expect(body.email).toEqual(expectedResult.email)
    })

    it('should fail and return response status 404 with error message', async () => {
      const mockedUser: User = userFactory.build()
      const expectedResult = {
        message: 'User not found',
        details: {
          context: mockedUser.id,
        },
        isOperational: true,
      }

      response = await fetch(`${url}/${mockedUser.id}`)
      body = (await response.json()) as Record<string, unknown>

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(NOT_FOUND)
      expect(body).to.be.an('object')
      expect(body).toEqual(expectedResult)
    })
  })

  describe('PUT /users/{userId}', () => {
    const endpoint = '/users'
    const url = `http://localhost:${config.getPort()}${endpoint}`
    let response: Response
    let body: Record<string, unknown>

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

      response = await fetch(`${url}/${mockedUser.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockedUpdatedUser),
      })
      body = (await response.json()) as Record<string, unknown>

      const rowCount = 1
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(OK)
      expect(body).to.be.an('object')
      expect(body).toEqual(expectedResult)
    })

    it('should fail and return response status 404 with error message', async () => {
      const mockedUser: User = userFactory.build()
      const mockedUpdatedUser: User = userFactory.build()
      mockedUpdatedUser.id = undefined
      const expectedResult = {
        message: 'User not found',
        details: {
          context: { userId: mockedUser.id, user: mockedUpdatedUser },
        },
        isOperational: true,
      }

      response = await fetch(`${url}/${mockedUser.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockedUpdatedUser),
      })
      body = (await response.json()) as Record<string, unknown>

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(NOT_FOUND)
      expect(body).to.be.an('object')
      expect(body).toEqual(expectedResult)
    })
  })

  describe('DELETE  /users/{userId}', () => {
    const endpoint = '/users'
    const url = `http://localhost:${config.getPort()}${endpoint}`
    let response: Response
    let body: Record<string, unknown>

    it('should succeed and return a deleted user', async () => {
      const mockedUser: User = userFactory.build()
      const rawUserData = UserMapper.toPersistence(mockedUser)
      const insertedUser = await dbService.db
        .insert(schemas.usersTable)
        .values(rawUserData)
        .returning()
      mockedUser.id = UserMapper.toDomain(insertedUser[0]).id
      const expectedResult = mockedUser

      response = await fetch(`${url}/${mockedUser.id}`, {
        method: 'DELETE',
      })
      body = (await response.json()) as Record<string, unknown>

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(OK)
      expect(body).to.be.an('object')
      expect(body).toEqual(expectedResult)
    })

    it('should fail and return response status 404 with error message', async () => {
      const mockedUser: User = userFactory.build()
      const expectedResult = {
        message: 'User not found',
        details: {
          context: mockedUser.id,
        },
        isOperational: true,
      }

      response = await fetch(`${url}/${mockedUser.id}`, {
        method: 'DELETE',
      })
      body = (await response.json()) as Record<string, unknown>

      const rowCount = 0
      await expect(
        factory.dbService.getDatabaseTableRowCount('users'),
      ).resolves.toEqual(rowCount)
      expect(response.status).toBe(NOT_FOUND)
      expect(body).to.be.an('object')
      expect(body).toEqual(expectedResult)
    })
  })
})
