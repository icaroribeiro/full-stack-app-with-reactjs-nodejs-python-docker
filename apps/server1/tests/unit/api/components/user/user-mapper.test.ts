import { describe, expect, it } from 'vitest'
import {
  UserMapper,
  UserResponse,
} from '../../../../../src/api/components/user'
import { UserFactory } from '../../../../factories/user-factory'

describe('UserMapper', () => {
  const userMapper = new UserMapper()
  const userFactory = new UserFactory()

  describe('.toPersistence', () => {
    it('should define a function', () => {
      expect(typeof userMapper.toPersistence).toBe('function')
    })

    it('should succeed and return a raw user data', async () => {
      const mockedUser = userMapper.toDomain(userFactory.build())
      const expectedResult = { name: mockedUser.name, email: mockedUser.email }

      const result = userMapper.toPersistence(mockedUser)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('.toDomain', () => {
    it('should define a function', () => {
      expect(typeof userMapper.toDomain).toBe('function')
    })

    it('should succeed and return a user from domain', async () => {
      const mockedUser = userMapper.toDomain(userFactory.build())
      const rawUserData = {
        id: mockedUser.id,
        name: mockedUser.name,
        email: mockedUser.email,
        createdAt: mockedUser.createdAt,
        updatedAt: mockedUser.updatedAt,
      }
      const expectedResult = mockedUser

      const result = userMapper.toDomain(rawUserData)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('.toResponse', () => {
    it('should define a function', () => {
      expect(typeof userMapper.toResponse).toBe('function')
    })

    it('should succeed and return a user response', async () => {
      const mockedUser = userMapper.toDomain(userFactory.build())
      const userResponse: UserResponse = {
        id: mockedUser.id,
        name: mockedUser.name,
        email: mockedUser.email,
        createdAt: mockedUser.createdAt,
        updatedAt: mockedUser.updatedAt,
      }
      const expectedResult = userResponse

      const result = userMapper.toResponse(mockedUser)

      expect(result).toEqual(expectedResult)
    })
  })
})
