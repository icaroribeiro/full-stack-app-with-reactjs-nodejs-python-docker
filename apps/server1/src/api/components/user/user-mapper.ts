/* eslint-disable @typescript-eslint/no-explicit-any */
import { User, UserResponse } from './user-types'

interface IUserMapper {
  toPersistence(user: User): any
  toDomain(raw: any): User
  toResponse(user: User): UserResponse
}

class UserMapper implements IUserMapper {
  toPersistence(user: User): any {
    return {
      name: user.name,
      email: user.email,
    }
  }

  toDomain(raw: any): User {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  toResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}

export { UserMapper }
