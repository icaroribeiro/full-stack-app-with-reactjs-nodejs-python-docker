import { SQL } from 'drizzle-orm'
import { PgColumn, PgSelect } from 'drizzle-orm/pg-core'

function withPagination<T extends PgSelect>(
  qb: T,
  page: number,
  limit: number,
  ...orderByColumns: (PgColumn | SQL | SQL.Aliased)[]
) {
  return qb
    .orderBy(...orderByColumns)
    .limit(limit)
    .offset((page - 1) * limit)
}

export { withPagination }
