import { literal, union, ZodTypeAny } from 'zod'

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

export { genOptional, genOptionalWithEmptyLiteral }
