import { INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status'

import { IPaginationService, PaginationConfig } from '../../../services'
import { ServerError } from '../../server-error'
import { APIPaginatedEntityResponse } from '../../shared'
import { User } from './user-models'
import { IUserRepository } from './user-repository'

interface IUserService {
  registerUser(user: User): Promise<User>
  // retrieveUserList(): Promise<UserList>
  retrieveUsers(
    paginationConfig: PaginationConfig,
  ): Promise<APIPaginatedEntityResponse<User>>
  retrieveUser(userId: string): Promise<User>
  replaceUser(userId: string, user: User): Promise<User>
  removeUser(userId: string): Promise<User>
}

class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private paginationService: IPaginationService,
  ) {}

  async registerUser(user: User): Promise<User> {
    try {
      return await this.userRepository.createUser(user)
    } catch (error) {
      const message = 'An error occurred when creating a new user into database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: user,
        cause: error,
      })
    }
  }

  // async retrieveUserList(): Promise<UserList> {
  //   try {
  //     return await this.userRepository.readUserList()
  //   } catch (error) {
  //     const message =
  //       'An error occurred when reading list of users from database'
  //     throw new ServerError(message, INTERNAL_SERVER_ERROR, {
  //       context: undefined,
  //       cause: error,
  //     })
  //   }
  // }

  async retrieveUsers(
    paginationConfig: PaginationConfig,
  ): Promise<APIPaginatedEntityResponse<User>> {
    try {
      const limit = paginationConfig.limit
      const offset = (paginationConfig.page - 1) * limit
      const [records, totalRecords] =
        await this.userRepository.readAndCountUsers(limit, offset)
      return this.paginationService.paginateRecords<User>(
        paginationConfig,
        totalRecords,
        records,
      )
    } catch (error) {
      const message =
        'An error occurred when reading and counting users from database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: undefined,
        cause: error,
      })
    }
  }

  async retrieveUser(userId: string): Promise<User> {
    let retrievedUser: User | undefined
    try {
      retrievedUser = await this.userRepository.readUser(userId)
    } catch (error) {
      const message = 'An error occurred when reading a user from database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: userId,
        cause: error,
      })
    }
    if (retrievedUser === undefined) {
      const message = 'User not found'
      throw new ServerError(message, NOT_FOUND, {
        context: userId,
        cause: undefined,
      })
    }
    return retrievedUser
  }

  async replaceUser(userId: string, user: User): Promise<User> {
    let replacedUser: User | undefined
    try {
      replacedUser = await this.userRepository.updateUser(userId, user)
    } catch (error) {
      const message = 'An error occurred when updating a user in database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: { userId: userId, user: user },
        cause: error,
      })
    }
    if (replacedUser === undefined) {
      const message = 'User not found'
      throw new ServerError(message, NOT_FOUND, {
        context: { userId: userId, user: user },
        cause: undefined,
      })
    }
    return replacedUser
  }

  async removeUser(userId: string): Promise<User> {
    let removedUser: User | undefined
    try {
      removedUser = await this.userRepository.deleteUser(userId)
    } catch (error) {
      const message = 'An error occurred when deleting a user from database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: userId,
        cause: error,
      })
    }
    if (removedUser === undefined) {
      const message = 'User not found'
      throw new ServerError(message, NOT_FOUND, {
        context: userId,
        cause: undefined,
      })
    }
    return removedUser
  }
}

export { IUserService, UserService }
