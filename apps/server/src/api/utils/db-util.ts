import { SQL } from 'drizzle-orm'
import { PgColumn, PgSelect } from 'drizzle-orm/pg-core'

function withPagination<T extends PgSelect>(
  query: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  page = 1,
  limit = 3,
) {
  return query
    .orderBy(orderByColumn)
    .limit(limit)
    .offset((page - 1) * limit)
}

export { withPagination }
