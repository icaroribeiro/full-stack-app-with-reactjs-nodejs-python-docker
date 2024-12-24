import httpStatus from 'http-status'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  closeHttpServer,
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
  const timeout = 60000

  beforeAll(async () => {
    container = await startDatabaseContainer(config)
    dbService.connectDatabase(config.getDatabaseURL())
    startHttpServer(config)
  }, timeout)

  afterAll(async () => {
    closeHttpServer()
    await dbService.disconnectDatabase()
    await stopDatabaseContainer(container)
  }, timeout)

  describe('GET /health', () => {
    it('should succeed and return 200 status code when application is healthy', async () => {
      const expectedResponseBody = { healthy: true }

      const response = await fetch(url)

      expect(response.status).toBe(httpStatus.OK)
      const responseBody = (await response.json()) as Record<string, unknown>
      expect(responseBody).toEqual(expectedResponseBody)
    })
  })
})
