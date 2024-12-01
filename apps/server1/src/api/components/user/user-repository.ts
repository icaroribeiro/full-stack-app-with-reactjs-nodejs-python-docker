import * as schemas from '@db/schemas'
import { count, desc, eq } from 'drizzle-orm'

import { DBService } from '../../../services'
import { withPagination } from '../../shared'
import { UserMapper } from './user-mapper'
import { User } from './user-types'

interface IUserRepository {
  createUser(user: User): Promise<User>
  // readUsers(): Promise<UserList>
  readAndCountUsers(page: number, limit: number): Promise<[User[], number]>
  readUser(userId: string): Promise<User | null>
  updateUser(userId: string, user: User): Promise<User | null>
  deleteUser(userId: string): Promise<User | null>
}

class UserRepository implements IUserRepository {
  dbService: DBService

  constructor(dbService: DBService) {
    this.dbService = dbService
  }

  async createUser(user: User): Promise<User> {
    const userMapper = new UserMapper()
    const rawUserData = userMapper.toPersistence(user)
    const result = await this.dbService.db
      .insert(schemas.userSchema)
      .values(rawUserData)
      .returning()
    return result.map((u) => userMapper.toDomain(u))[0]
  }

  // async readUsers(): Promise<UserList> {
  //   const result = await this.dbService.db.select().from(schemas.userSchema)
  //   return result.map((u) => UserMapper.toDomain(u))
  // }

  async readAndCountUsers(
    page: number,
    limit: number,
  ): Promise<[User[], number]> {
    const userMapper = new UserMapper()
    const userListQuery = this.dbService.db
      .select({ id: schemas.userSchema.id })
      .from(schemas.userSchema)
    const paginatedRecordsSubquery = withPagination(
      userListQuery.$dynamic(),
      page,
      limit,
      desc(schemas.userSchema.createdAt),
    ).as('subquery')
    const paginatedRecordsResult = await this.dbService.db
      .select()
      .from(schemas.userSchema)
      .innerJoin(
        paginatedRecordsSubquery,
        eq(schemas.userSchema.id, paginatedRecordsSubquery.id),
      )
      .orderBy(desc(schemas.userSchema.createdAt))
    const totalRecordsResult = await this.dbService.db
      .select({ count: count() })
      .from(schemas.userSchema)

    return [
      paginatedRecordsResult.map((r) => userMapper.toDomain(r.users)),
      totalRecordsResult[0].count,
    ]
  }

  async readUser(userId: string): Promise<User | null> {
    const userMapper = new UserMapper()
    const result = await this.dbService.db
      .select()
      .from(schemas.userSchema)
      .where(eq(schemas.userSchema.id, userId))
    if (result.length == 0) {
      return null
    }
    return result.map((u) => userMapper.toDomain(u))[0]
  }

  async updateUser(userId: string, user: User): Promise<User | null> {
    const userMapper = new UserMapper()
    const result = await this.dbService.db
      .update(schemas.userSchema)
      .set({ name: user.name, email: user.email })
      .where(eq(schemas.userSchema.id, userId))
      .returning()
    if (result.length == 0) {
      return null
    }
    return result.map((u) => userMapper.toDomain(u))[0]
  }

  async deleteUser(userId: string): Promise<User | null> {
    const userMapper = new UserMapper()
    const result = await this.dbService.db
      .delete(schemas.userSchema)
      .where(eq(schemas.userSchema.id, userId))
      .returning()
    if (result.length == 0) {
      return null
    }
    return result.map((u) => userMapper.toDomain(u))[0]
  }
}

export { IUserRepository, UserRepository }
