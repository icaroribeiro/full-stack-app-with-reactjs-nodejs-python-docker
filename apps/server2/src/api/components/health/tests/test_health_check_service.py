# import 'reflect-metadata'
# import { INTERNAL_SERVER_ERROR } from 'http-status'
# import { afterEach, describe, expect, it, vi } from 'vitest'

# import { DBService } from '../../../../services'
# import { ServerError } from '../../../../server-error'
# import { HealthCheckService } from '..'

# vi.mock('../../../../services', () => {
#   const actual = vi.importActual<typeof import('../../../../services')>(
#     '../../../../services',
#   )
#   return {
#     ...actual,
#     DBService: vi.fn(),
#   }
# })

# describe('HealthCheckService', () => {
#   const mockedDBService = vi.mocked(new DBService())

#   afterEach(() => {
#     vi.clearAllMocks()
#   })

#   describe('.checkHealth', () => {
#     it('should define a function', () => {
#       const healthCheckService = new HealthCheckService(mockedDBService)

#       expect(typeof healthCheckService.checkHealth).toBe('function')
#     })

#     it('should succeed and return true', () => {
#       const mockedCheckDatabaseIsAlive = vi.fn().mockReturnValue(true)
#       mockedDBService.checkDatabaseIsAlive = mockedCheckDatabaseIsAlive
#       const expectedResult = true

#       const healthCheckService = new HealthCheckService(mockedDBService)
#       const result = healthCheckService.checkHealth()

#       expect(result).toEqual(expectedResult)
#       expect(mockedCheckDatabaseIsAlive).toHaveBeenCalledOnce()
#     })

#     it("should fail and throw exception when health can't be checked", () => {
#       const error = new Error('failed')
#       const message = 'An error occurred when checking if application is alive'
#       const serverError = new ServerError(message, INTERNAL_SERVER_ERROR, {
#         context: 'unknown',
#         cause: error,
#       })
#       const mockedCheckDatabaseIsAlive = vi.fn().mockImplementation(() => {
#         throw new Error('failed')
#       })
#       mockedDBService.checkDatabaseIsAlive = mockedCheckDatabaseIsAlive

#       const healthCheckService = new HealthCheckService(mockedDBService)

#       expect(() => healthCheckService.checkHealth()).toThrowError(serverError)
#       expect(mockedCheckDatabaseIsAlive).toHaveBeenCalledOnce()
#     })
#   })
# })
