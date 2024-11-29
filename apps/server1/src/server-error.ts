import { HttpErrorBase } from '@curveball/http-errors'
import httpStatus from 'http-status'

type Detail = {
  context?: unknown
  cause?: unknown
}
class ServerError extends HttpErrorBase {
  public readonly newDetail?: Detail
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode?: number, detail?: Detail) {
    super(message)
    this.newDetail = detail
    this.statusCode = statusCode ? statusCode : httpStatus.INTERNAL_SERVER_ERROR
    this.isOperational = `${statusCode}`.startsWith('4') ? true : false
    // Error.captureStackTrace(this, this.constructor)
  }
}

export { Detail, ServerError }
