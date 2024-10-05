/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import { INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } from 'http-status'
import { ValidateError } from 'tsoa'

import { AppError } from '../../app-error'
import { ErrorResponse } from '../shared'

function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      message: error.message,
      details: { context: error.context, cause: error.cause },
      isOperational: error.isOperational,
    }
    res.status(error.httpCode).json(response)
  }

  if (error instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, error.fields)
    const response: ErrorResponse = {
      message: 'Validation Failed',
      details: { context: error?.fields, cause: error },
      isOperational: true,
    }
    res.status(UNPROCESSABLE_ENTITY).json(response)
  }

  if (error instanceof Error) {
    const response: ErrorResponse = {
      message: error.message,
      details: { context: 'unknown', cause: error },
      isOperational: false,
    }
    res.status(INTERNAL_SERVER_ERROR).json(response)
  }
}

export { errorMiddleware }
