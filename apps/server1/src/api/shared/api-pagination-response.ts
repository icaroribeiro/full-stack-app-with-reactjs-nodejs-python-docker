type APIPaginationResponse<Entity> = {
  page: number
  limit: number
  totalPages: number
  totalRecords: number
  records: Entity[]
  previous?: string
  next?: string
}

export { APIPaginationResponse }
