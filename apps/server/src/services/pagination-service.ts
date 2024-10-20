import { APIPaginatedEntityResponse } from '../api/shared'

type PaginationConfig = {
  url: string
  page: number
  limit: number
}

interface IPaginationService {
  paginateRecords<Entity>(
    paginationConfig: PaginationConfig,
    totalRecords: number,
    records: Entity[],
  ): APIPaginatedEntityResponse<Entity>
}

class PaginationService {
  public paginateRecords<Entity>(
    paginationConfig: PaginationConfig,
    totalRecords: number,
    records: Entity[],
  ): APIPaginatedEntityResponse<Entity> {
    return {
      page: paginationConfig.page,
      limit: paginationConfig.limit,
      totalPages: this.getTotalPages(paginationConfig, totalRecords),
      totalRecords: totalRecords,
      records: records,
      previous: this.getPreviousPage(paginationConfig, totalRecords),
      next: this.getNextPage(paginationConfig, totalRecords),
    }
  }

  private getTotalPages(
    paginationConfig: PaginationConfig,
    totalRecords: number,
  ): number {
    return Math.ceil(totalRecords / paginationConfig.limit)
  }

  private getPreviousPage(
    paginationConfig: PaginationConfig,
    totalRecords: number,
  ): string | undefined {
    // if (paginationConfig.page == 1) {
    //   return undefined
    // }
    if (paginationConfig.page * paginationConfig.limit < totalRecords) {
      return undefined
    }
    const url = paginationConfig.url
    if (url.includes('page')) {
      return url.replace(/(page=)[^&]+/, '$1' + `${paginationConfig.page - 1}`)
    }
    return url + `&page=${paginationConfig.page - 1}`
  }

  private getNextPage(
    paginationConfig: PaginationConfig,
    totalRecords: number,
  ): string | undefined {
    if (paginationConfig.page * paginationConfig.limit >= totalRecords) {
      return undefined
    }
    const url = paginationConfig.url
    if (url.includes('page')) {
      return url.replace(/(page=)[^&]+/, '$1' + `${paginationConfig.page + 1}`)
    }
    return url + `?page=${paginationConfig.page + 1}`
  }
}

export { IPaginationService, PaginationConfig, PaginationService }
