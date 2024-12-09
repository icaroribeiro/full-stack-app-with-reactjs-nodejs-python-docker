import httpStatus from 'http-status'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  config,
  dbService,
  startDatabaseContainer,
  startHttpServer,
  stopDatabaseContainer,
} from '../../../../test-helpers'
import { HealthCheckResponse } from '../../../../../src/api/components/health-check'
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql'

describe('Health Check HTTP', () => {
  const endpoint = '/health'
  const url = `http://localhost:${config.getPort()}${endpoint}`
  let container: StartedPostgreSqlContainer
  const beforeAllTimeout = 30000

  beforeAll(async () => {
    container = await startDatabaseContainer(config)
    dbService.connectDatabase(config.getDatabaseURL())
    startHttpServer(config)
  }, beforeAllTimeout)

  afterAll(async () => {
    await dbService.deactivateDatabase()
    await stopDatabaseContainer(container)
  })

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
