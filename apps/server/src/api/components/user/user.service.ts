import { INTERNAL_SERVER_ERROR } from 'http-status'

import { ServerError } from '../../server-error'
import { User, UserList } from './user.models'
import { IUserRepository } from './user.repository'

interface IUserService {
  registerUser(user: User): Promise<User>
  retrieveUserList(): Promise<UserList>
  retrieveUser(userId: string): Promise<User>
  replaceUser(userId: string, user: User): Promise<User>
  removeUser(userId: string): Promise<User>
}

class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

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

  async retrieveUserList(): Promise<UserList> {
    try {
      return await this.userRepository.readUserList()
    } catch (error) {
      const message = 'An error occurred when reading user list from database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: undefined,
        cause: error,
      })
    }
  }

  async retrieveUser(userId: string): Promise<User> {
    try {
      return await this.userRepository.readUser(userId)
    } catch (error) {
      const message = 'An error occurred when reading a user from database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: userId,
        cause: error,
      })
    }
  }

  async replaceUser(userId: string, user: User): Promise<User> {
    try {
      return await this.userRepository.updateUser(userId, user)
    } catch (error) {
      const message = 'An error occurred when updating a user in database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: { userId: userId, user: user },
        cause: error,
      })
    }
  }

  async removeUser(userId: string): Promise<User> {
    try {
      return await this.userRepository.deleteUser(userId)
    } catch (error) {
      const message = 'An error occurred when deleting a user from database'
      throw new ServerError(message, INTERNAL_SERVER_ERROR, {
        context: userId,
        cause: error,
      })
    }
  }
}

export { IUserService, UserService }
