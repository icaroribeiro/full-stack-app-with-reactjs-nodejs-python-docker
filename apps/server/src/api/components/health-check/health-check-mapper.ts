import { HealthCheckResponse } from './health-check-types'

class HealthCheckMapper {
  public static toResponse(isHealthy: boolean): HealthCheckResponse {
    return {
      healthy: isHealthy,
    }
  }
}

export { HealthCheckMapper }
