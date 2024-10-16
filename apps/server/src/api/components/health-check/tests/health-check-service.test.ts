import { INTERNAL_SERVER_ERROR } from 'http-status'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DBService } from '../../../../services'
import { ServerError } from '../../../server-error'
import { HealthCheckService } from '../health-check-service'

describe('HealthCheckService', () => {
  const mockedDBService = new DBService()

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('.checkHealth', () => {
    it('defines a function', () => {
      const healthCheckService = new HealthCheckService(mockedDBService)
      expect(typeof healthCheckService.checkHealth).toBe('function')
    })

    it('should succeed and return true', () => {
      const mockedIsDatabaseAlive = vi.fn().mockReturnValue(true)
      mockedDBService.isDatabaseAlive = mockedIsDatabaseAlive
      const expectedResult = true

      const healthCheckService = new HealthCheckService(mockedDBService)
      const result = healthCheckService.checkHealth()

      expect(result).toEqual(expectedResult)
      expect(mockedIsDatabaseAlive).toHaveBeenCalledOnce()
    })

    it("should fail and throw exception when health can't be checked", () => {
      const error = new Error('failed')
      const message = 'An error occurred when checking if application is alive'
      const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: 'unknown',
        cause: error,
      })
      const mockedIsDatabaseAlive = vi.fn().mockImplementation(() => {
        throw new Error('failed')
      })
      mockedDBService.isDatabaseAlive = mockedIsDatabaseAlive

      const healthCheckService = new HealthCheckService(mockedDBService)

      expect(() => healthCheckService.checkHealth()).toThrowError(serverError)
      expect(mockedIsDatabaseAlive).toHaveBeenCalledOnce()
    })
  })
})
