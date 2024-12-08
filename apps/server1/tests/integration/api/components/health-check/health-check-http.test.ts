import httpStatus from 'http-status'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { config } from '../../../../test-helpers'
import { HealthCheckResponse } from '../../../../../src/api/components/health-check'

describe('Health Check HTTP', () => {
  const endpoint = '/health'
  const url = `http://localhost:${config.getPort()}${endpoint}`

  // const factory: HttpTestFactory = new HttpTestFactory()

  // beforeAll(async () => {
  //   await factory.prepareAll()
  // }, factory.beforeAllTimeout)

  // afterEach(async () => {
  //   await factory.closeEach()
  // })

  // afterAll(async () => {
  //   await factory.closeAll()
  // })

  describe('GET /health', () => {
    it('should succeed and return application is healthy', async () => {
      const expectedResult: HealthCheckResponse = { healthy: true }

      const response: Response = await fetch(url)

      expect(response.status).toBe(httpStatus.OK)
      const body: Array<Record<string, unknown>> =
        (await response.json()) as Array<Record<string, unknown>>
      expect(body).toEqual(expectedResult)
    })
  })
})
