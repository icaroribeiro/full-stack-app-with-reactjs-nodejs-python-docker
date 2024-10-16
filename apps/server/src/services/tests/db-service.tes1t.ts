import { sql } from 'drizzle-orm'
import { INTERNAL_SERVER_ERROR } from 'http-status'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { db } from '../../../../db/db'
import { ServerError } from '../../../server-error'
import { HealthCheckService } from '../health-check-service'

vi.mock('../../db/db', (importOriginal) => {
  const original = importOriginal<typeof import('../../../../db/db')>()
  return {
    ...original,
    db: vi.fn(),
  }
})

describe('HealthCheckService', () => {
  const mockedDB = vi.mocked(
    db.connect('postgresql://pgtestuser:pgtestsecret@localhost:1234/pgtestdb'),
  )

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('.checkHealth', () => {
    it('defines a function', () => {
      const healthCheckService = new HealthCheckService(mockedDB)
      expect(typeof healthCheckService.checkHealth).toBe('function')
    })

    it('should succeed and return true', () => {
      const mockedExecute = vi.fn().mockResolvedValue(Promise.resolve())
      mockedDB.execute = mockedExecute
      const expectedResult = true

      const healthCheckService = new HealthCheckService(mockedDB)
      const result = healthCheckService.checkHealth()

      expect(result).toEqual(expectedResult)
      expect(mockedExecute).toHaveBeenCalledWith(sql`SELECT 1`)
    })

    it("should fail and throw exception when health can't be checked", () => {
      const error = new Error('failed')
      const message = 'An error occurred when checking if application is alive'
      const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: 'unknown',
        cause: error,
      })
      const mockedExecute = vi.fn().mockImplementation(() => {
        throw new Error('failed')
      })
      mockedDB.execute = mockedExecute

      const healthCheckService = new HealthCheckService(mockedDB)

      expect(() => healthCheckService.checkHealth()).toThrowError(serverError)
      expect(mockedExecute).toHaveBeenCalledWith(sql`SELECT 1`)
    })
  })
})
