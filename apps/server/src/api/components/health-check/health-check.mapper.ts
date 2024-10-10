import { HealthCheckDTO } from './healthcheck.models'

class HealthCheckMapper {
  public static toDTO(isHealthy: boolean): HealthCheckDTO {
    return {
      healthy: isHealthy,
    }
  }
}

export { HealthCheckMapper }
