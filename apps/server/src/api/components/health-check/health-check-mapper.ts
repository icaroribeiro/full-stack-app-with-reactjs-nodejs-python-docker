import { HealthCheckDTO } from './health-check-models'

class HealthCheckMapper {
  public static toDTO(isHealthy: boolean): HealthCheckDTO {
    return {
      healthy: isHealthy,
    }
  }
}

export { HealthCheckMapper }
