import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { ValidateError } from 'tsoa'

import { Detail, ServerError } from '../../server-error'
import { APIErrorResponse } from '../shared'

class APIErrorHandler {
  public handleError(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | void {
    if (error instanceof ValidateError) {
      const response: APIErrorResponse = {
        message: 'Validation failed',
        detail: { context: error?.fields, cause: error },
        isOperational: true,
      }
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json(response)
    }

    if (error instanceof ServerError) {
      const response: APIErrorResponse = {
        message: error.message,
        detail: error.newDetail,
        isOperational: error.isOperational,
      }
      return res.status(error.statusCode).json(response)
    }

    if (error instanceof Error) {
      const response: APIErrorResponse = {
        message: error.message,
        detail: { context: undefined, cause: error } as Detail,
        isOperational: false,
      }
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json(response)
      return
    }

    next()
  }
}

export { APIErrorHandler }
