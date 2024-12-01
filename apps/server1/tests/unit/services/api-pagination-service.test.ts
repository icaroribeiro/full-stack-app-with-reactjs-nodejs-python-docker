// import { describe, expect, it } from 'vitest'

// import { User, UserList } from '../../api/components/user'
// import { UserFactory } from '../../factories/user-factory'
// import { APIPaginationService } from '../../../src/services/api-pagination-service'

// describe('PaginationService', () => {
//   const baseURL = 'http://localhost:5002/users'
//   const apiPaginationService = new APIPaginationService()

//   const userFactory = new UserFactory.build()

//   describe('.createResponse', () => {
//     it('should define a function', () => {
//       expect(typeof apiPaginationService.createAPIPaginationResponse).toBe(
//         'function',
//       )
//     })

//     it('should succeed and return a response with neither previous nor next fields when page is 1', () => {
//       const page = 1
//       const limit = 1
//       const totalPages = 0
//       const totalRecords = 0
//       const count = 0
//       const records: UserList = userFactory.buildMany(count)
//       const apiPaginationData = {
//         page: page,
//         limit: limit,
//         totalRecords: totalRecords,
//         records: records,
//       }
//       const expectedResult = {
//         page: apiPaginationData.page,
//         limit: apiPaginationData.limit,
//         totalPages: totalPages,
//         totalRecords: totalRecords,
//         records: records,
//         previous: undefined,
//         next: undefined,
//       }

//       const paginationService = new PaginationService()
//       const result = paginationService.createResponse<User>(
//         baseURL,
//         apiPaginationData,
//       )

//       expect(result).toEqual(expectedResult)
//     })

//     it('should succeed and return a response with no previous field when previous page is filled with all records', () => {
//       const baseURL = 'http://localhost:5002/users?page=2'
//       const page = 2
//       const limit = 1
//       const totalPages = 1
//       const totalRecords = 1
//       const count = 1
//       const records: UserList = userFactory.buildMany(count)
//       const apiPaginationData = {
//         page: page,
//         limit: limit,
//         totalRecords: totalRecords,
//         records: records,
//       }
//       const expectedResult = {
//         page: apiPaginationData.page,
//         limit: apiPaginationData.limit,
//         totalPages: totalPages,
//         totalRecords: totalRecords,
//         records: records,
//         previous: undefined,
//         next: undefined,
//       }

//       const paginationService = new PaginationService()
//       const result = paginationService.createResponse<User>(
//         baseURL,
//         apiPaginationData,
//       )

//       expect(result).toEqual(expectedResult)
//     })

//     it('should succeed and return a response with no previous field when previous page can still be filled with some records', () => {
//       const baseURL = 'http://localhost:5002/users?page=2&limit=2'
//       const page = 2
//       const limit = 2
//       const totalPages = 1
//       const totalRecords = 1
//       const count = 1
//       const records: UserList = userFactory.buildMany(count)
//       const apiPaginationData = {
//         page: page,
//         limit: limit,
//         totalRecords: totalRecords,
//         records: records,
//       }
//       const expectedResult = {
//         page: apiPaginationData.page,
//         limit: apiPaginationData.limit,
//         totalPages: totalPages,
//         totalRecords: totalRecords,
//         records: records,
//         previous: undefined,
//         next: undefined,
//       }

//       const paginationService = new PaginationService()
//       const result = paginationService.createResponse<User>(
//         baseURL,
//         apiPaginationData,
//       )

//       expect(result).toEqual(expectedResult)
//     })

//     it('should succeed and return a response with previous field when previous page cannot to be filled with all records', () => {
//       const baseURL = 'http://localhost:5002/users?page=2'
//       const page = 2
//       const limit = 1
//       const totalPages = 2
//       const totalRecords = 2
//       const count = 1
//       const records: UserList = userFactory.buildMany(count)
//       const apiPaginationData = {
//         page: page,
//         limit: limit,
//         totalRecords: totalRecords,
//         records: records,
//       }
//       let previous = baseURL
//       previous = previous.replace(/(page=)[^&]+/, '$1' + `${page - 1}`)
//       const expectedResult = {
//         page: apiPaginationData.page,
//         limit: apiPaginationData.limit,
//         totalPages: totalPages,
//         totalRecords: totalRecords,
//         records: records,
//         previous: previous,
//         next: undefined,
//       }

//       const paginationService = new PaginationService()
//       const result = paginationService.createResponse<User>(
//         baseURL,
//         apiPaginationData,
//       )

//       expect(result).toEqual(expectedResult)
//     })

//     it('should succeed and return a response with no next field when current page is filled with all records', () => {
//       const baseURL = 'http://localhost:5002/users?page=3'
//       const page = 3
//       const limit = 1
//       const totalPages = 3
//       const totalRecords = 3
//       const count = 1
//       const records: UserList = userFactory.buildMany(count)
//       const apiPaginationData = {
//         page: page,
//         limit: limit,
//         totalRecords: totalRecords,
//         records: records,
//       }
//       let previous = baseURL
//       previous = previous.replace(/(page=)[^&]+/, '$1' + `${page - 1}`)
//       const expectedResult = {
//         page: apiPaginationData.page,
//         limit: apiPaginationData.limit,
//         totalPages: totalPages,
//         totalRecords: totalRecords,
//         records: records,
//         previous: previous,
//         next: undefined,
//       }

//       const paginationService = new PaginationService()
//       const result = paginationService.createResponse<User>(
//         baseURL,
//         apiPaginationData,
//       )

//       expect(result).toEqual(expectedResult)
//     })

//     it('should succeed and return a response with next field when only page query param is sent in request url', () => {
//       const baseURL = 'http://localhost:5002/users?page=1'
//       const page = 1
//       const limit = 1
//       const totalPages = 2
//       const totalRecords = 2
//       const count = 1
//       const records: UserList = userFactory.buildMany(count)
//       const apiPaginationData = {
//         page: page,
//         limit: limit,
//         totalRecords: totalRecords,
//         records: records,
//       }
//       let next = baseURL
//       next = next.replace(/(page=)[^&]+/, '$1' + `${page + 1}`)
//       const expectedResult = {
//         page: apiPaginationData.page,
//         limit: apiPaginationData.limit,
//         totalPages: totalPages,
//         totalRecords: totalRecords,
//         records: records,
//         previous: undefined,
//         next: next,
//       }

//       const paginationService = new PaginationService()
//       const result = paginationService.createResponse<User>(
//         baseURL,
//         apiPaginationData,
//       )

//       expect(result).toEqual(expectedResult)
//     })

//     it('should succeed and return a response with next field when only limit query param is sent in request url', () => {
//       const baseURL = 'http://localhost:5002/users?limit=2'
//       const page = 1
//       const limit = 2
//       const totalPages = 2
//       const totalRecords = 4
//       const count = 2
//       const records: UserList = userFactory.buildMany(count)
//       const apiPaginationData = {
//         page: page,
//         limit: limit,
//         totalRecords: totalRecords,
//         records: records,
//       }
//       const next = baseURL + `&page=${page + 1}`
//       const expectedResult = {
//         page: apiPaginationData.page,
//         limit: apiPaginationData.limit,
//         totalPages: totalPages,
//         totalRecords: totalRecords,
//         records: records,
//         previous: undefined,
//         next: next,
//       }

//       const paginationService = new PaginationService()
//       const result = paginationService.createResponse<User>(
//         baseURL,
//         apiPaginationData,
//       )

//       expect(result).toEqual(expectedResult)
//     })

//     it('should succeed and return a response with next field when neither page nor limit query params are sent in request url', () => {
//       const baseURL = 'http://localhost:5002/users'
//       const page = 1
//       const limit = 1
//       const totalPages = 2
//       const totalRecords = 2
//       const count = 1
//       const records: UserList = userFactory.buildMany(count)
//       const apiPaginationData = {
//         page: page,
//         limit: limit,
//         totalRecords: totalRecords,
//         records: records,
//       }
//       const next = baseURL + `?page=${page + 1}&limit=${limit}`
//       const expectedResult = {
//         page: apiPaginationData.page,
//         limit: apiPaginationData.limit,
//         totalPages: totalPages,
//         totalRecords: totalRecords,
//         records: records,
//         previous: undefined,
//         next: next,
//       }

//       const paginationService = new PaginationService()
//       const result = paginationService.createResponse<User>(
//         baseURL,
//         apiPaginationData,
//       )

//       expect(result).toEqual(expectedResult)
//     })
//   })
// })
