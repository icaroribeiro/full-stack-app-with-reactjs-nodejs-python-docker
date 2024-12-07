import { describe, expect, it } from 'vitest'
import {
  HealthCheckMapper,
  HealthCheckResponse,
} from '../../../../../src/api/components/health-check'

describe('HealthCheckMapper', () => {
  const healthCheckMapper = new HealthCheckMapper()

  describe('.toResponse', () => {
    it('should define a function', () => {
      expect(typeof healthCheckMapper.toResponse).toBe('function')
    })

    it('should succeed and return health check response', async () => {
      const isHealthy = true
      const healthCheckResponse: HealthCheckResponse = {
        healthy: isHealthy,
      }
      const expectedResult = healthCheckResponse

      const result = healthCheckMapper.toResponse(isHealthy)

      expect(result).toEqual(expectedResult)
    })
  })
})
