import { describe, expect, it } from 'vitest'

import { UserFactory } from '../../../../factories/helpers/user.factory'
import { UserMapper } from '../user.mapper'
import { User, UserDTO } from '../user.models'
describe('UserMapper', async () => {
  const userFactory = new UserFactory()

  describe('.toPersistence', () => {
    it('defines a function', () => {
      expect(typeof UserMapper.toPersistence).toBe('function')
    })

    it('should succeed and return a raw user data', async () => {
      const mockedUser: User = userFactory.build()
      const expectedResult = { name: mockedUser.name, email: mockedUser.email }

      const result = UserMapper.toPersistence(mockedUser)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('.toDomain', () => {
    it('defines a function', () => {
      expect(typeof UserMapper.toDomain).toBe('function')
    })

    it('should succeed and return a user from domain', async () => {
      const mockedUser: User = userFactory.build()
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

  describe('.toDTO', () => {
    it('defines a function', () => {
      expect(typeof UserMapper.toDTO).toBe('function')
    })

    it('should succeed and return a user data transfer object', async () => {
      const mockedUser: User = userFactory.build()
      const userDTO: UserDTO = {
        id: mockedUser.id || 'unknown',
        name: mockedUser.name,
        email: mockedUser.email,
      }
      const expectedResult = userDTO

      const result = UserMapper.toDTO(mockedUser)

      expect(result).toEqual(expectedResult)
    })
  })
})
