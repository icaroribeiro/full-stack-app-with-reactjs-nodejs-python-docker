import { INTERNAL_SERVER_ERROR } from 'http-status'

class AppError extends Error {
  public readonly httpCode: number
  public readonly context?: unknown
  public readonly isOperational: boolean

  constructor(
    message: string,
    httpCode?: number,
    details?: { context?: unknown; cause?: unknown },
  ) {
    super(message, { cause: details?.cause })
    this.name = this.constructor.name
    this.context = details?.context
    this.httpCode = httpCode ? httpCode : INTERNAL_SERVER_ERROR
    this.isOperational = `${httpCode}`.startsWith('4') ? true : false
    Error.captureStackTrace(this, this.constructor)
  }
}

export { AppError }
