import { z } from 'zod'

import { genOptional } from './validator-util'

const minimumPage = '1'
const minimumLimit = '1'
const maximumLimit = '10'

const paginationParamsValidator = z.object({
  query: z.object({
    page: genOptional(z.coerce.number().min(parseInt(minimumPage))).default(
      parseInt(minimumPage),
    ),
    limit: genOptional(
      z.coerce.number().min(parseInt(minimumLimit)).max(parseInt(maximumLimit)),
    ).default(parseInt(minimumLimit)),
  }),
})

export { paginationParamsValidator }
