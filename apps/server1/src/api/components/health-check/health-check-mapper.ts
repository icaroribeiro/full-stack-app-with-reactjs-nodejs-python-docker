import { HealthCheckResponse } from './health-check-types'

interface IHealthCheckMapper {
  toResponse(isHealthy: boolean): HealthCheckResponse
}
class HealthCheckMapper implements IHealthCheckMapper {
  toResponse(isHealthy: boolean): HealthCheckResponse {
    return {
      healthy: isHealthy,
    }
  }
}

export { HealthCheckMapper }
