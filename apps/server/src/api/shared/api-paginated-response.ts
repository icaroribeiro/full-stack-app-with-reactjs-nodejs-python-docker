type APIPaginatedResponse<Entity> = {
  page: number
  pageSize: number
  totalPages: number
  totalRecords: number
  records: Entity[]
  previous?: string
  next?: string
}

export { APIPaginatedResponse }
