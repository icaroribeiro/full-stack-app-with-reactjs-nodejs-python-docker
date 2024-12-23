import * as schemas from '@db/schemas'
import { count, desc, eq } from 'drizzle-orm'
import httpStatus from 'http-status'
import { DBService } from '../../../services'
import { withPagination } from '../../shared'
import { UserMapper } from './user-mapper'
import { User } from './user-types'
import { ServerError } from '../../../server-error'

interface IUserRepository {
  createUser(user: User): Promise<User | undefined>
  readAndCountUsers(
    page: number,
    limit: number,
  ): Promise<[User[] | undefined, number | undefined]>
  readUser(userId: string): Promise<User | undefined>
  updateUser(userId: string, user: User): Promise<User | undefined>
  deleteUser(userId: string): Promise<User | undefined>
}

class UserRepository implements IUserRepository {
  dbService: DBService

  constructor(dbService: DBService) {
    this.dbService = dbService
  }

  async createUser(user: User): Promise<User | undefined> {
    return await this.dbService.db?.transaction(async (tx) => {
      try {
        const userMapper = new UserMapper()
        const rawUserData = userMapper.toPersistence(user)
        const result = await tx
          .insert(schemas.userSchema)
          .values(rawUserData)
          .returning()
        return result.map((u) => userMapper.toDomain(u))[0]
      } catch (error) {
        const message = 'An error occurred when creating a user into database'
        console.error(message, error)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: user,
            cause: error,
          })
        }
      }
    })
  }

  async readAndCountUsers(
    page: number,
    limit: number,
  ): Promise<[User[] | undefined, number | undefined]> {
    return await this.dbService.db?.transaction(async (tx) => {
      try {
        const userMapper = new UserMapper()
        const userIdsQuery = this.dbService.db
          .select({ id: schemas.userSchema.id })
          .from(schemas.userSchema)

        const paginatedUsersSubquery = withPagination(
          userIdsQuery.$dynamic(),
          page,
          limit,
          desc(schemas.userSchema.createdAt),
        ).as('subquery')

        const result = await tx
          .select()
          .from(schemas.userSchema)
          .innerJoin(
            paginatedUsersSubquery,
            eq(schemas.userSchema.id, paginatedUsersSubquery.id),
          )
          .orderBy(desc(schemas.userSchema.createdAt))
        const records = result.map((r) => userMapper.toDomain(r.users))

        const result2 = await tx
          .select({ count: count() })
          .from(schemas.userSchema)
        const total = result2[0].count

        return [records, total]
      } catch (error) {
        const message =
          'An error occurred when reading and couting users from database'
        console.error(message, error)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: { page: page, limit: limit },
            cause: error,
          })
        }
      }
    })
  }

  async readUser(userId: string): Promise<User | undefined> {
    return await this.dbService.db?.transaction(async (tx) => {
      try {
        const userMapper = new UserMapper()
        const result = await tx
          .select()
          .from(schemas.userSchema)
          .where(eq(schemas.userSchema.id, userId))
        return result.map((u) => userMapper.toDomain(u))[0]
      } catch (error) {
        const message = 'An error occurred when reading a user from database'
        console.error(message, error)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: userId,
            cause: error,
          })
        }
      }
    })
  }

  async updateUser(userId: string, user: User): Promise<User | undefined> {
    return await this.dbService.db?.transaction(async (tx) => {
      try {
        const result = await tx
          .update(schemas.userSchema)
          .set({ name: user.name, email: user.email })
          .where(eq(schemas.userSchema.id, userId))
          .returning()
        const userMapper = new UserMapper()
        return result.map((u) => userMapper.toDomain(u))[0]
      } catch (error) {
        const message = 'An error occurred when updating a user from database'
        console.error(message, error)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: { userId: userId, user: user },
            cause: error,
          })
        }
      }
    })
  }

  async deleteUser(userId: string): Promise<User | undefined> {
    return await this.dbService.db?.transaction(async (tx) => {
      try {
        const result = await tx
          .delete(schemas.userSchema)
          .where(eq(schemas.userSchema.id, userId))
          .returning()
        const userMapper = new UserMapper()
        return result.map((u) => userMapper.toDomain(u))[0]
      } catch (error) {
        const message = 'An error occurred when deleting a user from database'
        console.error(message, error)
        try {
          tx.rollback()
        } finally {
          throw new ServerError(message, httpStatus.INTERNAL_SERVER_ERROR, {
            context: userId,
            cause: error,
          })
        }
      }
    })
  }
}

export { IUserRepository, UserRepository }
