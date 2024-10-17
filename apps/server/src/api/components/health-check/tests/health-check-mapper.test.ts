import { describe, expect, it } from 'vitest'

import { HealthCheckMapper } from '../health-check-mapper'
import { HealthCheckDTO } from '../health-check-models'

describe('HealthCheckMapper', async () => {
  describe('.toDTO', () => {
    it('should define a function', () => {
      expect(typeof HealthCheckMapper.toDTO).toBe('function')
    })

    it('should succeed and return a health check data transfer object', async () => {
      const isHealthy: boolean = true
      const healthCheckDTO: HealthCheckDTO = {
        healthy: isHealthy,
      }
      const expectedResult = healthCheckDTO

      const result = HealthCheckMapper.toDTO(isHealthy)

      expect(result).toEqual(expectedResult)
    })
  })
})
