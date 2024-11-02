# import { describe, expect, it } from 'vitest'

# import { HealthCheckResponse, HealthCheckMapper } from '..'

# describe('HealthCheckMapper', async () => {
#   describe('.toResponse', () => {
#     it('should define a function', () => {
#       expect(typeof HealthCheckMapper.toResponse).toBe('function')
#     })

#     it('should succeed and return a health check data transfer object', async () => {
#       const isHealthy: boolean = true
#       const healthCheckResponse: HealthCheckResponse = {
#         healthy: isHealthy,
#       }
#       const expectedResult = healthCheckResponse

#       const result = HealthCheckMapper.toResponse(isHealthy)

#       expect(result).toEqual(expectedResult)
#     })
#   })
# })
