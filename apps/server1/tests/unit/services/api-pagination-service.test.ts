import { describe, expect, it } from 'vitest'

import { User, UserMapper } from '../../../src/api/components/user'
import { UserFactory } from '../../factories/user-factory'
import {
  APIPaginationData,
  APIPaginationService,
} from '../../../src/services/api-pagination-service'
import { APIPaginationResponse } from '../../../src/api/shared'
import { beforeEach } from 'node:test'

describe('APIPaginationService', () => {
  let baseURL = 'http://localhost:5002/users'
  const userMapper = new UserMapper()
  const userFactory = new UserFactory()
  const apiPaginationService = new APIPaginationService()

  describe('.createResponse', () => {
    it('should define a function', () => {
      expect(typeof apiPaginationService.createResponse).toBe('function')
    })

    it('should succeed and return a response when there are no records', () => {
      const page = 1
      const limit = 1
      const totalPages = 0
      const totalRecords = 0
      const records: User[] = []
      const apiPaginationData: APIPaginationData<User> = {
        page: page,
        limit: limit,
        totalRecords: totalRecords,
        records: records,
      }
      const expectedResult: APIPaginationResponse<User> = {
        page: apiPaginationData.page,
        limit: apiPaginationData.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
      }

      const result = apiPaginationService.createResponse<User>(
        baseURL,
        apiPaginationData,
      )

      expect(result).toEqual(expectedResult)
    })

    it('should succeed and return a response when previous page is completely filled with all records', () => {
      const url = `${baseURL}?page=2`
      const page = 2
      const limit = 1
      const totalPages = 1
      const totalRecords = 1
      const records: User[] = []
      const apiPaginationData: APIPaginationData<User> = {
        page: page,
        limit: limit,
        totalRecords: totalRecords,
        records: records,
      }
      const expectedResult: APIPaginationResponse<User> = {
        page: apiPaginationData.page,
        limit: apiPaginationData.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
      }

      const result = apiPaginationService.createResponse<User>(
        url,
        apiPaginationData,
      )

      expect(result).toEqual(expectedResult)
    })

    it('should succeed and return a response when previous page is not completely filled with all records', () => {
      const url = `${baseURL}?page=2&limit=2`
      const page = 2
      const limit = 2
      const totalPages = 1
      const totalRecords = 1
      const records: User[] = []
      const apiPaginationData: APIPaginationData<User> = {
        page: page,
        limit: limit,
        totalRecords: totalRecords,
        records: records,
      }
      const expectedResult: APIPaginationResponse<User> = {
        page: apiPaginationData.page,
        limit: apiPaginationData.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
      }

      const result = apiPaginationService.createResponse<User>(
        url,
        apiPaginationData,
      )

      expect(result).toEqual(expectedResult)
    })

    it('should succeed and return a response when previous page is completely filled and there are still records left', () => {
      const url = `${baseURL}?page=2`
      const page = 2
      const limit = 1
      const totalPages = 2
      const totalRecords = 2
      const count = 1
      const records: User[] = userFactory
        .buildBatch(count)
        .map((u) => userMapper.toResponse(u))
      const apiPaginationData: APIPaginationData<User> = {
        page: page,
        limit: limit,
        totalRecords: totalRecords,
        records: records,
      }
      const previous = url.replace(/(page=)[^&]+/, '$1' + `${page - 1}`)
      const expectedResult: APIPaginationResponse<User> = {
        page: apiPaginationData.page,
        limit: apiPaginationData.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
        previous: previous,
      }

      const result = apiPaginationService.createResponse<User>(
        url,
        apiPaginationData,
      )

      expect(result).toEqual(expectedResult)
    })

    it('should succeed and return a response when current page is completely filled with all records', () => {
      const url = `${baseURL}?page=3`
      const page = 3
      const limit = 1
      const totalPages = 3
      const totalRecords = 3
      const count = 1
      const records: User[] = userFactory
        .buildBatch(count)
        .map((u) => userMapper.toResponse(u))
      const apiPaginationData: APIPaginationData<User> = {
        page: page,
        limit: limit,
        totalRecords: totalRecords,
        records: records,
      }
      const previous = url.replace(/(page=)[^&]+/, '$1' + `${page - 1}`)
      const expectedResult: APIPaginationResponse<User> = {
        page: apiPaginationData.page,
        limit: apiPaginationData.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
        previous: previous,
      }

      const result = apiPaginationService.createResponse<User>(
        url,
        apiPaginationData,
      )

      expect(result).toEqual(expectedResult)
    })

    it('should succeed and return a response when only page query param is sent in request url', () => {
      const url = `${baseURL}?page=1`
      const page = 1
      const limit = 1
      const totalPages = 2
      const totalRecords = 2
      const count = 1
      const records: User[] = userFactory
        .buildBatch(count)
        .map((u) => userMapper.toResponse(u))
      const apiPaginationData: APIPaginationData<User> = {
        page: page,
        limit: limit,
        totalRecords: totalRecords,
        records: records,
      }
      const next = url.replace(/(page=)[^&]+/, '$1' + `${page + 1}`)
      const expectedResult: APIPaginationResponse<User> = {
        page: apiPaginationData.page,
        limit: apiPaginationData.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
        next: next,
      }

      const result = apiPaginationService.createResponse<User>(
        url,
        apiPaginationData,
      )

      expect(result).toEqual(expectedResult)
    })

    it('should succeed and return a response when only limit query param is sent in request url', () => {
      const url = `${baseURL}?limit=2`
      const page = 1
      const limit = 2
      const totalPages = 2
      const totalRecords = 4
      const count = 2
      const records: User[] = userFactory
        .buildBatch(count)
        .map((u) => userMapper.toResponse(u))
      const apiPaginationData: APIPaginationData<User> = {
        page: page,
        limit: limit,
        totalRecords: totalRecords,
        records: records,
      }
      const next = `${url}&page=${page + 1}`
      const expectedResult: APIPaginationResponse<User> = {
        page: apiPaginationData.page,
        limit: apiPaginationData.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
        next: next,
      }

      const result = apiPaginationService.createResponse<User>(
        url,
        apiPaginationData,
      )

      expect(result).toEqual(expectedResult)
    })

    it('should succeed and return a response when neither page nor limit query params are sent in request url', () => {
      const page = 1
      const limit = 1
      const totalPages = 2
      const totalRecords = 2
      const count = 2
      const records: User[] = userFactory
        .buildBatch(count)
        .map((u) => userMapper.toResponse(u))
      const apiPaginationData: APIPaginationData<User> = {
        page: page,
        limit: limit,
        totalRecords: totalRecords,
        records: records,
      }
      const next = `${baseURL}?page=${page + 1}&limit=${limit}`
      const expectedResult: APIPaginationResponse<User> = {
        page: apiPaginationData.page,
        limit: apiPaginationData.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
        next: next,
      }

      const result = apiPaginationService.createResponse<User>(
        baseURL,
        apiPaginationData,
      )

      expect(result).toEqual(expectedResult)
    })
  })
})
