import { APIPaginatedEntityResponse } from '../api/shared'

type PaginationConfig<Entity> = {
  page: number
  limit: number
  totalRecords: number
  records: Entity[]
}

interface IPaginationService {
  createResponse<Entity>(
    baseURL: string,
    paginationConfig: PaginationConfig<Entity>,
  ): APIPaginatedEntityResponse<Entity>
}

class PaginationService {
  public createResponse<Entity>(
    baseURL: string,
    paginationConfig: PaginationConfig<Entity>,
  ): APIPaginatedEntityResponse<Entity> {
    return {
      page: paginationConfig.page,
      limit: paginationConfig.limit,
      totalPages: this.getTotalPages(
        paginationConfig.limit,
        paginationConfig.totalRecords,
      ),
      totalRecords: paginationConfig.totalRecords,
      records: paginationConfig.records,
      previous: this.getPreviousPage(
        baseURL,
        paginationConfig.page,
        paginationConfig.limit,
        paginationConfig.totalRecords,
      ),
      next: this.getNextPage(
        baseURL,
        paginationConfig.page,
        paginationConfig.limit,
        paginationConfig.totalRecords,
      ),
    }
  }

  private getTotalPages(limit: number, totalRecords: number): number {
    return Math.ceil(totalRecords / limit)
  }

  private getPreviousPage(
    baseURL: string,
    page: number,
    limit: number,
    totalRecords: number,
  ): string | undefined {
    if (page == 1) {
      return undefined
    }
    if (totalRecords - (page - 1) * limit <= 0) {
      return undefined
    }
    const formattedURL = baseURL
    return formattedURL.replace(/(page=)[^&]+/, '$1' + `${page - 1}`)
  }

  private getNextPage(
    baseURL: string,
    page: number,
    limit: number,
    totalRecords: number,
  ): string | undefined {
    if (totalRecords - page * limit <= 0) {
      return undefined
    }
    const formattedURL = baseURL
    if (formattedURL.includes('page')) {
      return formattedURL.replace(/(page=)[^&]+/, '$1' + `${page + 1}`)
    }
    if (formattedURL.includes('limit')) {
      return formattedURL + `&page=${page + 1}`
    }
    return formattedURL + `?page=${page + 1}&limit=1`
  }
}

export { IPaginationService, PaginationConfig, PaginationService }
