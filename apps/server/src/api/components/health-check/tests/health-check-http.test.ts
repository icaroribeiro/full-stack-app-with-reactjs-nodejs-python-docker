import { OK } from 'http-status'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { config } from '../../../../config/config'
import { HttpTestFactory } from '../../../../factories/http-factory'

describe('Health Check HTTP component', () => {
  const factory: HttpTestFactory = new HttpTestFactory()

  beforeAll(async () => {
    await factory.prepareAll()
  }, factory.beforeAllTimeout)

  afterEach(async () => {
    await factory.closeEach()
  })

  afterAll(async () => {
    await factory.closeAll()
  })

  describe('GET /health', () => {
    const endpoint = '/health'
    const url = `http://localhost:${config.getPort()}${endpoint}`
    let response: Response
    let body: Array<Record<string, unknown>>

    it('should succeed and return application is healthy', async () => {
      const expectedResult = { healthy: true }

      response = await fetch(url)
      body = (await response.json()) as Array<Record<string, unknown>>

      expect(response.status).toBe(OK)

      expect(body).to.be.an('object')
      expect(body).toEqual(expectedResult)
    })
  })
})
