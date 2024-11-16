import { describe, expect, it } from 'vitest'

import { UserFactory } from '../../../../factories/helpers/user-factory'
import { User, UserResponse, UserMapper } from '..'

describe('UserMapper', async () => {
  const userFactory = new UserFactory.build()

  describe('.toPersistence', () => {
    it('should define a function', () => {
      expect(typeof UserMapper.toPersistence).toBe('function')
    })

    it('should succeed and return a raw user data', async () => {
      const mockedUser = userFactory.build()
      const expectedResult = { name: mockedUser.name, email: mockedUser.email }

      const result = UserMapper.toPersistence(mockedUser)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('.toDomain', () => {
    it('should define a function', () => {
      expect(typeof UserMapper.toDomain).toBe('function')
    })

    it('should succeed and return a user from domain', async () => {
      const mockedUser = userFactory.build()
      const rawUserData = {
        id: mockedUser.id,
        name: mockedUser.name,
        email: mockedUser.email,
      }
      const expectedResult = mockedUser

      const result = UserMapper.toDomain(rawUserData)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('.toResponse', () => {
    it('should define a function', () => {
      expect(typeof UserMapper.toResponse).toBe('function')
    })

    it('should succeed and return a user data transfer object', async () => {
      const mockedUser: User = userFactory.build()
      const userResponse: UserResponse = {
        id: mockedUser.id || 'unknown',
        name: mockedUser.name,
        email: mockedUser.email,
      }
      const expectedResult = userResponse

      const result = UserMapper.toResponse(mockedUser)

      expect(result).toEqual(expectedResult)
    })
  })
})
