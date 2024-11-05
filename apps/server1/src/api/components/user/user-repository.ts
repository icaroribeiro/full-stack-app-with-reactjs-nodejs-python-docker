import * as schemas from '@db/schemas'
import { count, desc, eq } from 'drizzle-orm'

import { DBService } from '../../../services'
import { withPagination } from '../../shared'
import { UserMapper } from './user-mapper'
import { User, UserList } from './user-types'

interface IUserRepository {
  createUser(user: User): Promise<User>
  // readUsers(): Promise<UserList>
  readAndCountUsers(page: number, limit: number): Promise<[UserList, number]>
  readUser(userId: string): Promise<User>
  updateUser(userId: string, user: User): Promise<User>
  deleteUser(userId: string): Promise<User>
}

class UserRepository implements IUserRepository {
  dbService: DBService

  constructor(dbService: DBService) {
    this.dbService = dbService
  }

  async createUser(user: User): Promise<User> {
    const rawUserData = UserMapper.toPersistence(user)
    const result = await this.dbService.db
      .insert(schemas.usersTable)
      .values(rawUserData)
      .returning()
    return result.map((u) => UserMapper.toDomain(u))[0]
  }

  // async readUsers(): Promise<UserList> {
  //   const result = await this.dbService.db.select().from(schemas.usersTable)
  //   return result.map((u) => UserMapper.toDomain(u))
  // }

  async readAndCountUsers(
    page: number,
    limit: number,
  ): Promise<[UserList, number]> {
    const userListQuery = this.dbService.db
      .select({ id: schemas.usersTable.id })
      .from(schemas.usersTable)

    const paginatedRecordsSubquery = withPagination(
      userListQuery.$dynamic(),
      page,
      limit,
      desc(schemas.usersTable.createdAt),
    ).as('subquery')

    const paginatedRecordsResult = await this.dbService.db
      .select()
      .from(schemas.usersTable)
      .innerJoin(
        paginatedRecordsSubquery,
        eq(schemas.usersTable.id, paginatedRecordsSubquery.id),
      )
      .orderBy(desc(schemas.usersTable.createdAt))

    const totalRecordsResult = await this.dbService.db
      .select({ count: count() })
      .from(schemas.usersTable)

    return [
      paginatedRecordsResult.map((r) => UserMapper.toDomain(r.users)),
      totalRecordsResult[0].count,
    ]
  }

  async readUser(userId: string): Promise<User> {
    const result = await this.dbService.db
      .select()
      .from(schemas.usersTable)
      .where(eq(schemas.usersTable.id, userId))
    return result.map((u) => UserMapper.toDomain(u))[0]
  }

  async updateUser(userId: string, user: User): Promise<User> {
    const result = await this.dbService.db
      .update(schemas.usersTable)
      .set({ name: user.name, email: user.email })
      .where(eq(schemas.usersTable.id, userId))
      .returning()
    return result.map((u) => UserMapper.toDomain(u))[0]
  }

  async deleteUser(userId: string): Promise<User> {
    const result = await this.dbService.db
      .delete(schemas.usersTable)
      .where(eq(schemas.usersTable.id, userId))
      .returning()
    return result.map((u) => UserMapper.toDomain(u))[0]
  }
}

export { IUserRepository, UserRepository }
