import httpStatus from 'http-status'
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
import { IHealthCheckService } from './health-check-service'
import { HealthCheckResponse } from './health-check-types'

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
  @Example<HealthCheckResponse>({
    healthy: true,
  })
  @Response<APIErrorResponse>('500', 'Internal Server Error', {
    message: 'Internal Server Error',
    detail: { context: '', cause: '' },
    isOperational: false,
  })
  getHealth(): HealthCheckResponse {
    const isHealthy = this.healthCheckService.checkHealth()
    const healthCheckMapper = new HealthCheckMapper()
    const healthCheckResponse = healthCheckMapper.toResponse(isHealthy)
    this.setStatus(httpStatus.OK)
    return healthCheckResponse
  }
}

export { HealthCheckController }
