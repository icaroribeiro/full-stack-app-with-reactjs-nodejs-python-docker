import { describe, expect, it } from 'vitest'

import { User, UserList } from '../../api/components/user'
import { UserFactory } from '../../factories/helpers/user-factory'
import { PaginationService } from '../pagination-service'

describe('PaginationService', () => {
  const url = 'http://localhost:5002/users/'
  const userFactory = new UserFactory()

  describe('.paginateRecords', () => {
    it('should define a function', () => {
      const paginationService = new PaginationService()

      expect(typeof paginationService.paginateRecords).toBe('function')
    })

    it('should succeed and return a response with an empty list of paginated entity and neither previous nor next fields', () => {
      const page = 1
      const limit = 1
      const paginationConfig = {
        url: url,
        page: page,
        limit: limit,
      }
      const totalPages = 0
      const totalRecords = 0
      const count = 0
      const records: UserList = userFactory.buildMany(count)
      const expectedResult = {
        page: paginationConfig.page,
        limit: paginationConfig.limit,
        totalPages: totalPages,
        totalRecords: totalRecords,
        records: records,
      }

      const paginationService = new PaginationService()
      const result = paginationService.paginateRecords<User>(
        paginationConfig,
        totalRecords,
        records,
      )

      expect(result).toEqual(expectedResult)
    })

    // it('should succeed and return a list of paginated entity along with both previous and next fields', () => {
    //   const paginationConfig = {
    //     url: 'http://localhost:5002/users/',
    //     page: 1,
    //     limit: 2,
    //   }
    //   const totalRecords = 10
    //   const count = 3
    //   const mockedUserList: UserList = userFactory.buildMany(count)
    //   const expectedResult = {
    //     page: paginationConfig.page,
    //     limit: paginationConfig.limit,
    //     totalPages: 2,
    //     totalRecords: count,
    //     records: mockedUserList,
    //     next:
    //       paginationConfig.url +
    //       `?page=${paginationConfig.page + 1}&limit=${paginationConfig.limit}`,
    //   }

    //   const paginationService = new PaginationService()
    //   const result = paginationService.paginateRecords<User>()

    //   for (const token of listOfTokens) {
    //     expect(result.isRegistered(token)).toEqual(expectedResult)
    //   }
    // })

    // it('should succeed and return a list of paginated entity along with only previous field', () => {
    //   const paginationConfig = {
    //     url: 'http://localhost:5002/users/',
    //     page: 1,
    //     limit: 2,
    //   }
    //   const totalRecords = 10
    //   const count = 3
    //   const mockedUserList: UserList = userFactory.buildMany(count)
    //   const expectedResult = {
    //     page: paginationConfig.page,
    //     limit: paginationConfig.limit,
    //     totalPages: 2,
    //     totalRecords: count,
    //     records: mockedUserList,
    //     next:
    //       paginationConfig.url +
    //       `?page=${paginationConfig.page + 1}&limit=${paginationConfig.limit}`,
    //   }

    //   const paginationService = new PaginationService()
    //   const result = paginationService.paginateRecords<User>()

    //   for (const token of listOfTokens) {
    //     expect(result.isRegistered(token)).toEqual(expectedResult)
    //   }
    // })

    // it('should succeed and return a list of paginated entity along with only previous field', () => {
    //   const paginationConfig = {
    //     url: 'http://localhost:5002/users/',
    //     page: 1,
    //     limit: 2,
    //   }
    //   const totalRecords = 10
    //   const count = 3
    //   const mockedUserList: UserList = userFactory.buildMany(count)
    //   const expectedResult = {
    //     page: paginationConfig.page,
    //     limit: paginationConfig.limit,
    //     totalPages: 2,
    //     totalRecords: count,
    //     records: mockedUserList,
    //     next:
    //       paginationConfig.url +
    //       `?page=${paginationConfig.page + 1}&limit=${paginationConfig.limit}`,
    //   }

    //   const paginationService = new PaginationService()
    //   const result = paginationService.paginateRecords<User>()

    //   for (const token of listOfTokens) {
    //     expect(result.isRegistered(token)).toEqual(expectedResult)
    //   }
    // })
  })
})
