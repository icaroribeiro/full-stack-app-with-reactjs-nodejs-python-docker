import { z } from 'zod'

const userValidator = z.object({
  body: z.object({
    name: z.string().max(256, 'Maximum of 256 characters'),
    email: z.string().email(),
  }),
})

export { userValidator }
