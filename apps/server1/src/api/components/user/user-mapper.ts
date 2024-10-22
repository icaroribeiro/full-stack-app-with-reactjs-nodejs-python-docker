/* eslint-disable @typescript-eslint/no-explicit-any */
import { User, UserResponse } from './user-types'

class UserMapper {
  public static toPersistence(user: User): any {
    return {
      name: user.name,
      email: user.email,
    }
  }

  public static toDomain(raw: any): User {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
    }
  }

  public static toResponse(user: User): UserResponse {
    return {
      id: user.id || 'unknown',
      name: user.name,
      email: user.email,
    }
  }
}

export { UserMapper }
