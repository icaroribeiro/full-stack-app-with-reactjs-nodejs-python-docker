import express from 'express'

import { APIPaginatedResponse } from '../api/shared'

type PageParams = {
  req: express.Request
  page: number
  pageSize: number
}

interface IPagingService {
  paginateRecords<Entity>(
    pageParams: PageParams,
    totalRecords: number,
    records: Entity[],
  ): APIPaginatedResponse<Entity>
}

class PagingService {
  constructor() {}

  public paginateRecords<Entity>(
    pageParams: PageParams,
    totalRecords: number,
    records: Entity[],
  ): APIPaginatedResponse<Entity> {
    const url = this.prepareURL(pageParams)
    const totalPages = this.calculateTotalPages(pageParams, totalRecords)
    const previousPage = this.buildPreviousPage(pageParams, url)
    const nextPage = this.buildNextPage(pageParams, url, totalRecords)
    const result: APIPaginatedResponse<Entity> = {
      page: pageParams.page,
      pageSize: pageParams.pageSize,
      totalPages: totalPages,
      totalRecords: totalRecords,
      records: records,
      previous: previousPage,
      next: nextPage,
    }
    return result
  }

  private prepareURL(pageParams: PageParams): string {
    return `${pageParams.req.protocol}://${pageParams.req.get('host')}${pageParams.req.originalUrl}`
  }

  private calculateTotalPages(
    pageParams: PageParams,
    totalRecords: number,
  ): number {
    return Math.ceil(totalRecords / pageParams.pageSize)
  }

  private buildPreviousPage(
    pageParams: PageParams,
    url: string,
  ): string | undefined {
    if (pageParams.page == 1) {
      return undefined
    }
    if (url.includes('page')) {
      return url.replace(/(page=)[^&]+/, '$1' + `${pageParams.page - 1}`)
    }
    return url + `&page=${pageParams.page - 1}`
  }

  private buildNextPage(
    pageParams: PageParams,
    url: string,
    totalRecords: number,
  ): string | undefined {
    if (pageParams.page * pageParams.pageSize >= totalRecords) {
      return undefined
    }
    if (url.includes('page')) {
      return url.replace(/(page=)[^&]+/, '$1' + `${pageParams.page + 1}`)
    }
    return url + `?page=${pageParams.page + 1}`
  }
}

export { IPagingService, PageParams, PagingService }
