import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { AnyZodObject, ZodError, ZodOptional } from 'zod'
import { literal, union, ZodTypeAny } from 'zod'

import { APIErrorResponse } from '../shared'

function genOptional<T extends ZodTypeAny>(schema: T) {
  return schema
    .transform((value) => (value === '' ? undefined : value))
    .optional()
}

function genOptionalWithEmptyLiteral<T extends ZodTypeAny>(schema: T) {
  return union([schema, literal('')])
    .transform((value) => (value === '' ? undefined : value))
    .optional()
}

function validationMiddleware(
  schema: AnyZodObject | ZodOptional<AnyZodObject>,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const message = 'An error occurred when validating user input schemas'
        const context = error.errors.map((issue) => ({
          message: `${issue.path.join('.')} is ${issue.message}`,
        }))
        const response: APIErrorResponse = {
          message: message,
          detail: { context: context, cause: error },
          isOperational: true,
        }
        res.status(httpStatus.UNPROCESSABLE_ENTITY).json(response)
        return
      }

      if (error instanceof Error) {
        const message = 'An error occurred when validating user inputs'
        const response: APIErrorResponse = {
          message: message,
          detail: { context: undefined, cause: error },
          isOperational: true,
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(response)
        return
      }
    }
  }
}

export { genOptional, genOptionalWithEmptyLiteral, validationMiddleware }
