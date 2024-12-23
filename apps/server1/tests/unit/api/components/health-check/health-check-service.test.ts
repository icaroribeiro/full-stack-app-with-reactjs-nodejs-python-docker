import { afterEach, describe, expect, it, vi } from 'vitest'
import { DBService } from '../../../../../src/services'
import { HealthCheckService } from '../../../../../src/api/components/health-check'
import httpStatus from 'http-status'
import { ServerError } from '../../../../../src/server-error'

vi.mock('../../../../../src/services/db-service', () => {
  const actual = vi.importActual<
    typeof import('../../../../../src/services/db-service')
  >('../../../../../src/services/db-service')
  return {
    ...actual,
    DBService: vi.fn(),
  }
})

describe('HealthCheckService', () => {
  const dbService = vi.mocked(new DBService())
  const healthCheckService = new HealthCheckService(dbService)

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('.checkHealth', () => {
    it('should define a function', () => {
      expect(typeof healthCheckService.checkHealth).toBe('function')
    })

    it('should succeed and return true when application is healthy', async () => {
      const mockedCheckDatabaseIsAlive = vi.fn().mockReturnValue(true)
      dbService.checkDatabaseIsAlive = mockedCheckDatabaseIsAlive
      const expectedResult = true

      const result = await healthCheckService.checkHealth()

      expect(result).toEqual(expectedResult)
      expect(mockedCheckDatabaseIsAlive).toHaveBeenCalledOnce()
    })

    it('should fail and throw exception when application is not healthy', async () => {
      const error = new Error('failed')
      const message =
        'An error occurred when checking if application is healthy'
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
        {
          context: undefined,
          cause: error,
        },
      )
      const mockedCheckDatabaseIsAlive = vi.fn().mockImplementation(() => {
        throw new Error('failed')
      })
      dbService.checkDatabaseIsAlive = mockedCheckDatabaseIsAlive

      try {
        await healthCheckService.checkHealth()
      } catch (error) {
        const thrownError = error as unknown as ServerError
        expect(thrownError.message).toEqual(serverError.message)
        expect(thrownError.statusCode).toEqual(serverError.statusCode)
        expect(thrownError.isOperational).toEqual(serverError.isOperational)
      }
      expect(mockedCheckDatabaseIsAlive).toHaveBeenCalledOnce()
    })
  })
})
