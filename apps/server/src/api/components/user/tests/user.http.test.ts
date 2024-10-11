import { OK } from 'http-status'
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
import { UserFactory } from '../../../../factories/helpers/user.factory'
import { HttpTestFactory } from '../../../../factories/http.factory'

describe('User HTTP component', () => {
  const factory: HttpTestFactory = new HttpTestFactory()
  const userFactory = new UserFactory()

  beforeAll(async () => {
    await factory.prepareAll()
  }, factory.beforeAllTimeout)

  afterEach(async () => {
    await factory.closeEach()
  })

  afterAll(async () => {
    await factory.closeAll()
  })

  describe('GET /users', () => {
    const endpoint = '/users'
    const url = `http://localhost:${config.getPort()}${endpoint}`
    let response: Response
    let body: Array<{ [key: string]: unknown }>

    it('should succeed and return an empty list', async () => {
      response = await fetch(url)

      body = (await response.json()) as Array<{ [key: string]: unknown }>

      expect(response.status).toBe(OK)
      expectTypeOf(body).toBeArray()
      expect(body).toHaveLength(0)
      await expect(factory.getTableRowCount('users')).resolves.toEqual(0)
    })
  })
})
