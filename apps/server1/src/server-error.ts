import httpStatus from 'http-status'

class ServerError extends Error {
  public readonly httpCode: number
  public readonly context?: unknown
  public readonly isOperational: boolean

  constructor(
    message: string,
    httpCode?: number,
    details?: { context?: unknown; cause?: unknown },
  ) {
    super(message, details)
    this.name = this.constructor.name
    this.context = details?.context
    this.httpCode = httpCode ? httpCode : httpStatus.INTERNAL_SERVER_ERROR
    this.isOperational = `${httpCode}`.startsWith('4') ? true : false
    Error.captureStackTrace(this, this.constructor)
  }
}

export { ServerError }
