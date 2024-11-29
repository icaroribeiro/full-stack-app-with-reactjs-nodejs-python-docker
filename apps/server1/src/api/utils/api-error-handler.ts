import { APIErrorResponse } from '../shared'

import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { ValidateError } from 'tsoa'

import { Detail, ServerError } from '../../server-error'

class APIErrorHandler {
  public handleRequestValidationError(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (error instanceof ValidateError) {
      const response: APIErrorResponse = {
        message: 'Validation failed',
        detail: { context: error?.fields, cause: error },
        isOperational: true,
      }
      res.status(httpStatus.UNPROCESSABLE_ENTITY).json(response)
    }
  }

  public handleServerError(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (error instanceof ServerError) {
      const response: APIErrorResponse = {
        message: error.message,
        detail: error.newDetail,
        isOperational: error.isOperational,
      }
      res.status(error.statusCode).json(response)
    }
  }

  public handleCommonError(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (error instanceof Error) {
      const response: APIErrorResponse = {
        message: error.message,
        detail: { context: 'unknown', cause: error } as Detail,
        isOperational: false,
      }
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json(response)
    }
  }
}

export { APIErrorHandler }
