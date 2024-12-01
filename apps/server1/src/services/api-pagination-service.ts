import { APIPaginationResponse } from '../api/shared'

type APIPaginationData<Entity> = {
  page: number
  limit: number
  totalRecords: number
  records: Entity[]
}

interface IAPIPaginationService {
  createAPIPaginationResponse<Entity>(
    baseURL: string,
    apiPaginationData: APIPaginationData<Entity>,
  ): APIPaginationResponse<Entity>
}

class APIPaginationService {
  public createAPIPaginationResponse<Entity>(
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
  ): string | null {
    if (page == 1) {
      return null
    }
    if (totalRecords - (page - 1) * limit <= 0) {
      return null
    }
    const url = baseURL
    return url.replace(/(page=)[^&]+/, '$1' + `${page - 1}`)
  }

  private getNextPage(
    baseURL: string,
    page: number,
    limit: number,
    totalRecords: number,
  ): string | null {
    if (totalRecords - page * limit <= 0) {
      return null
    }
    const url = baseURL
    if (url.includes('page')) {
      return url.replace(/(page=)[^&]+/, '$1' + `${page + 1}`)
    }
    if (url.includes('limit')) {
      return url + `&page=${page + 1}`
    }
    return url + `?page=${page + 1}&limit=1`
  }
}

export { IAPIPaginationService, APIPaginationService, APIPaginationData }
