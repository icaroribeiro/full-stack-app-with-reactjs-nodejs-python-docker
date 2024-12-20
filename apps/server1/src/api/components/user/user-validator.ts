import { z } from 'zod'

const userSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
})

export { userSchema }
