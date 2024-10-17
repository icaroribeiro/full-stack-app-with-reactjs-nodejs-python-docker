/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import { INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } from 'http-status'
import { ValidateError } from 'tsoa'

import { ServerError } from '../server-error'
import { APIErrorResponse } from '../shared'

function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (error instanceof ServerError) {
    const response: APIErrorResponse = {
      message: error.message,
      details: { context: error.context, cause: error.cause },
      isOperational: error.isOperational,
    }
    res.status(error.httpCode).json(response)
    return
  }

  if (error instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, error.fields)
    const response: APIErrorResponse = {
      message: 'Validation Failed',
      details: { context: error?.fields, cause: error },
      isOperational: true,
    }
    res.status(UNPROCESSABLE_ENTITY).json(response)
    return
  }

  if (error instanceof Error) {
    const response: APIErrorResponse = {
      message: error.message,
      details: { context: 'unknown', cause: error },
      isOperational: false,
    }
    res.status(INTERNAL_SERVER_ERROR).json(response)
    return
  }
}

export { errorMiddleware }
