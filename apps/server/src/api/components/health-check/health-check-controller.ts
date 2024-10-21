import * as httpStatus from 'http-status'
import {
  Controller,
  Example,
  Get,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa'
import { inject, injectable } from 'tsyringe'

import { APIErrorResponse } from '../../shared'
import { HealthCheckMapper } from './health-check-mapper'
import { HealthCheckDTO } from './health-check-models'
import { IHealthCheckService } from './health-check-service'

@injectable()
@Route('health')
@Tags('health-check')
class HealthCheckController extends Controller {
  constructor(
    @inject('HealthCheckService')
    private healthCheckService: IHealthCheckService,
  ) {
    super()
  }

  /**
   * API endpoint used to verify if the service has started up correctly and is ready to accept requests
   */
  @Get('/')
  @SuccessResponse('200', 'OK')
  @Example<HealthCheckDTO>({
    healthy: true,
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    details: { context: undefined, cause: undefined },
    isOperational: false,
  })
  getHealth(): HealthCheckDTO {
    const isHealthy = this.healthCheckService.checkHealth()
    const healthCheckDTO = HealthCheckMapper.toDTO(isHealthy)
    this.setStatus(httpStatus.OK)
    return healthCheckDTO
  }
}

export { HealthCheckController }
