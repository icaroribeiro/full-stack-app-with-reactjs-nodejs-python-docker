import { z } from 'zod'

import { genOptional } from './utils'

const minimumPage = '1'
const minimumPageSize = '1'
const maximumPageSize = '10'

const pageQueryParamsValidator = z.object({
  query: z.object({
    page: genOptional(z.coerce.number().min(parseInt(minimumPage))).default(
      parseInt(minimumPage),
    ),
    pageSize: genOptional(
      z.coerce
        .number()
        .min(parseInt(minimumPageSize))
        .max(parseInt(maximumPageSize)),
    ).default(parseInt(minimumPageSize)),
  }),
})

export { pageQueryParamsValidator }
