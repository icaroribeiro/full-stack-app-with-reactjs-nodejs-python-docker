// import httpStatus from 'http-status'

// import { ServerError } from '../../../server-error'
// import { IUserRepository } from './user-repository'
// import { User } from './user-types'

// interface IUserService {
//   registerUser(user: User): Promise<User>
//   retrieveAndCountUsers(page: number, limit: number): Promise<[User[], number]>
//   retrieveUser(userId: string): Promise<User>
//   replaceUser(userId: string, user: User): Promise<User>
//   removeUser(userId: string): Promise<User>
// }

// class UserService implements IUserService {
//   userRepository: IUserRepository

//   constructor(userRepository: IUserRepository) {
//     this.userRepository = userRepository
//   }

//   async registerUser(user: User): Promise<User> {
//     let newUser: User | undefined

//     try {
//       newUser = await this.userRepository.createUser(user)
//     } catch (error) {
//       const message = 'An error occurred when registering a user'
//       throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
//         context: user,
//         cause: error,
//       })
//     }

//     if (newUser === undefined) {
//       const message = 'User not registered'
//       throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
//         context: user,
//         cause: undefined,
//       })
//     }

//     return newUser
//   }

//   async retrieveAndCountUsers(
//     page: number,
//     limit: number,
//   ): Promise<[User[], number]> {
//     let users: User[] | null
//     let total: number | null

//     try {
//       [users, total] = await this.userRepository.readAndCountUsers(page, limit))
//     } catch (error) {
//       const message = 'An error occurred when reading and counting users'
//       throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
//         context: {page: page, limit: limit},
//         cause: error,
//       })
//     }

//     if (!users || !total) {
//       const message = 'Users not found'
//       throw new ServerError(message, httpStatus.NOT_FOUND, {
//         context: {page: page, limit: limit},
//         cause: undefined,
//       })
//     }

//     return [users, total]
//   }

//   async retrieveUser(userId: string): Promise<User> {
//     let retrievedUser: User | null
//     try {
//       retrievedUser = await this.userRepository.readUser(userId)
//     } catch (error) {
//       const message = 'An error occurred when retrieving a user'
//       throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
//         context: userId,
//         cause: error,
//       })
//     }
//     if (!retrievedUser) {
//       const message = 'User not found'
//       throw new ServerError(message, httpStatus.NOT_FOUND, {
//         context: userId,
//         cause: undefined,
//       })
//     }
//     return retrievedUser
//   }

//   async replaceUser(userId: string, user: User): Promise<User> {
//     let replacedUser: User | null
//     try {
//       replacedUser = await this.userRepository.updateUser(userId, user)
//     } catch (error) {
//       const message = 'An error occurred when replacing a user'
//       throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
//         context: { userId: userId, user: user },
//         cause: error,
//       })
//     }
//     if (!replacedUser) {
//       const message = 'User not found'
//       throw new ServerError(message, httpStatus.NOT_FOUND, {
//         context: { userId: userId, user: user },
//         cause: undefined,
//       })
//     }
//     return replacedUser
//   }

//   async removeUser(userId: string): Promise<User> {
//     let removedUser: User | null
//     try {
//       removedUser = await this.userRepository.deleteUser(userId)
//     } catch (error) {
//       const message = 'An error occurred when removing a user'
//       throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
//         context: userId,
//         cause: error,
//       })
//     }
//     if (!removedUser) {
//       const message = 'User not found'
//       throw new ServerError(message, httpStatus.NOT_FOUND, {
//         context: userId,
//         cause: undefined,
//       })
//     }
//     return removedUser
//   }
// }

// export { IUserService, UserService }
