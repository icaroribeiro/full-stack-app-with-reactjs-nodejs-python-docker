import { HealthCheckResponse } from './health-check-types'

interface IHealthCheckMapper {
  toResponse(isHealthy: boolean): HealthCheckResponse
}
class HealthCheckMapper {
  toResponse(isHealthy: boolean): HealthCheckResponse {
    return {
      healthy: isHealthy,
    }
  }
}

export { HealthCheckMapper }
