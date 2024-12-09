import * as schemas from '@db/schemas'
import { count, desc, eq } from 'drizzle-orm'

import { DBService } from '../../../services'
import { withPagination } from '../../shared'
import { UserMapper } from './user-mapper'
import { User } from './user-types'

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
    const userMapper = new UserMapper()
    const rawUserData = userMapper.toPersistence(user)

    return await this.dbService.db.transaction(async (tx) => {
      try {
        const result = await tx
          .insert(schemas.userSchema)
          .values(rawUserData)
          .returning()
        return result.map((u) => userMapper.toDomain(u))[0]
      } catch (error) {
        const message = 'An error occurred when creating a user into database'
        console.error(message, error)
        tx.rollback()
      }
    })
  }

  async readAndCountUsers(
    page: number,
    limit: number,
  ): Promise<[User[] | undefined, number | undefined]> {
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

    const users: User[] | undefined = await this.dbService.db.transaction(
      async (tx) => {
        try {
          const result = await tx
            .select()
            .from(schemas.userSchema)
            .innerJoin(
              paginatedUsersSubquery,
              eq(schemas.userSchema.id, paginatedUsersSubquery.id),
            )
            .orderBy(desc(schemas.userSchema.createdAt))
          return result.map((r) => userMapper.toDomain(r.users))
        } catch (error) {
          const message =
            'An error occurred when reading and couting users from database'
          console.error(message, error)
          tx.rollback()
        }
      },
    )

    const total: number | undefined = await this.dbService.db.transaction(
      async (tx) => {
        try {
          const result = await tx
            .select({ count: count() })
            .from(schemas.userSchema)
          return result[0].count
        } catch (error) {
          const message =
            'An error occurred when reading and couting users from database'
          console.error(message, error)
          tx.rollback()
        }
      },
    )

    return [users, total]
  }

  async readUser(userId: string): Promise<User | undefined> {
    const userMapper = new UserMapper()

    return await this.dbService.db.transaction(async (tx) => {
      try {
        const result = await tx
          .select()
          .from(schemas.userSchema)
          .where(eq(schemas.userSchema.id, userId))
        // if (result.length == 0) {
        //   return
        // }
        return result.map((u) => userMapper.toDomain(u))[0]
      } catch (error) {
        const message = 'An error occurred when reading a user from database'
        console.error(message, error)
        tx.rollback()
      }
    })
  }

  async updateUser(userId: string, user: User): Promise<User | undefined> {
    const userMapper = new UserMapper()

    return await this.dbService.db.transaction(async (tx) => {
      try {
        const result = await tx
          .update(schemas.userSchema)
          .set({ name: user.name, email: user.email })
          .where(eq(schemas.userSchema.id, userId))
          .returning()
        // if (result.length == 0) {
        //   return undefined
        // }
        return result.map((u) => userMapper.toDomain(u))[0]
      } catch (error) {
        const message = 'An error occurred when deleting a user from database'
        console.error(message, error)
        tx.rollback()
      }
    })
  }

  async deleteUser(userId: string): Promise<User | undefined> {
    const userMapper = new UserMapper()

    return await this.dbService.db.transaction(async (tx) => {
      try {
        const result = await tx
          .delete(schemas.userSchema)
          .where(eq(schemas.userSchema.id, userId))
          .returning()
        // if (result.length == 0) {
        //   return undefined
        // }
        return result.map((u) => userMapper.toDomain(u))[0]
      } catch (error) {
        const message = 'An error occurred when deleting a user from database'
        console.error(message, error)
        tx.rollback()
      }
    })
  }
}

export { IUserRepository, UserRepository }
