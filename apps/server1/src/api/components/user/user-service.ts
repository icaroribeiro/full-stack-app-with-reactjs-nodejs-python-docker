import httpStatus from 'http-status'

import { ServerError } from '../../../server-error'
import { IUserRepository } from './user-repository'
import { User } from './user-types'

interface IUserService {
  registerUser(user: User): Promise<User>
  retrieveAndCountUsers(page: number, limit: number): Promise<[User[], number]>
  retrieveUser(userId: string): Promise<User>
  replaceUser(userId: string, user: User): Promise<User>
  removeUser(userId: string): Promise<User>
}

class UserService implements IUserService {
  userRepository: IUserRepository

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository
  }

  async registerUser(user: User): Promise<User> {
    let newUser: User | undefined

    try {
      newUser = await this.userRepository.createUser(user)
    } catch (error) {
      const message = 'An error occurred when creating a user'
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: user,
        cause: error,
      })
    }

    if (newUser === undefined) {
      const message = 'User could not be created'
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: user,
        cause: undefined,
      })
    }

    return newUser
  }

  async retrieveAndCountUsers(
    page: number,
    limit: number,
  ): Promise<[User[], number]> {
    let users: User[] | undefined
    let total: number | undefined

    try {
      ;[users, total] = await this.userRepository.readAndCountUsers(page, limit)
    } catch (error) {
      const message = 'An error occurred when reading and counting users'
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: { page: page, limit: limit },
        cause: error,
      })
    }

    if (users === undefined || total === undefined) {
      const message = 'Users could not be read and counted'
      throw new ServerError(message, httpStatus.NOT_FOUND, {
        context: { page: page, limit: limit },
        cause: undefined,
      })
    }

    return [users, total]
  }

  async retrieveUser(userId: string): Promise<User> {
    let user: User | undefined

    try {
      user = await this.userRepository.readUser(userId)
    } catch (error) {
      const message = 'An error occurred when reading a user'
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: userId,
        cause: error,
      })
    }

    if (user === undefined) {
      const message = 'User could not be read'
      throw new ServerError(message, httpStatus.NOT_FOUND, {
        context: userId,
        cause: undefined,
      })
    }

    return user
  }

  async replaceUser(userId: string, user: User): Promise<User> {
    let updatedUser: User | undefined

    try {
      updatedUser = await this.userRepository.updateUser(userId, user)
    } catch (error) {
      const message = 'An error occurred when updating a user'
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: { userId: userId, user: user },
        cause: error,
      })
    }

    if (updatedUser === undefined) {
      const message = 'User could not be updated'
      throw new ServerError(message, httpStatus.NOT_FOUND, {
        context: { userId: userId, user: user },
        cause: undefined,
      })
    }

    return updatedUser
  }

  async removeUser(userId: string): Promise<User> {
    let user: User | undefined

    try {
      user = await this.userRepository.deleteUser(userId)
    } catch (error) {
      const message = 'An error occurred when deleting a user'
      throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
        context: userId,
        cause: error,
      })
    }

    if (user === undefined) {
      const message = 'User could not be removed'
      throw new ServerError(message, httpStatus.NOT_FOUND, {
        context: userId,
        cause: undefined,
      })
    }

    return user
  }
}

export { IUserService, UserService }
