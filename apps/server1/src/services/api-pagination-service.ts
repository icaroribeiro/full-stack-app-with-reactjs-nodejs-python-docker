import { APIPaginationResponse } from '../api/shared'

type APIPaginationData<Entity> = {
  page: number
  limit: number
  totalRecords: number
  records: Entity[]
}

interface IAPIPaginationService {
  createResponse<Entity>(
    baseURL: string,
    apiPaginationData: APIPaginationData<Entity>,
  ): APIPaginationResponse<Entity>
}

class APIPaginationService {
  public createResponse<Entity>(
    baseURL: string,
    apiPaginationData: APIPaginationData<Entity>,
  ): APIPaginationResponse<Entity> {
    return {
      page: apiPaginationData.page,
      limit: apiPaginationData.limit,
      totalPages: this.getTotalPages(
        apiPaginationData.limit,
        apiPaginationData.totalRecords,
      ),
      totalRecords: apiPaginationData.totalRecords,
      records: apiPaginationData.records,
      previous: this.getPreviousPage(
        baseURL,
        apiPaginationData.page,
        apiPaginationData.limit,
        apiPaginationData.totalRecords,
      ),
      next: this.getNextPage(
        baseURL,
        apiPaginationData.page,
        apiPaginationData.limit,
        apiPaginationData.totalRecords,
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
    return baseURL.replace(/(page=)[^&]+/, '$1' + `${page - 1}`)
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
    if (baseURL.includes('page')) {
      return baseURL.replace(/(page=)[^&]+/, '$1' + `${page + 1}`)
    }
    if (baseURL.includes('limit')) {
      return baseURL + `&page=${page + 1}`
    }
    return baseURL + `?page=${page + 1}&limit=1`
  }
}

export { APIPaginationData,APIPaginationService, IAPIPaginationService }
