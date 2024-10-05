import * as schemas from '@db/schemas'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { UserMapper } from './user.mapper'
import { User, UserList } from './user.models'

interface IUserRepository {
  createUser(user: User): Promise<User>
  readUserList(): Promise<UserList>
  readUser(userId: string): Promise<User>
  updateUser(userId: string, user: User): Promise<User>
  deleteUser(userId: string): Promise<User>
}

class UserRepository implements IUserRepository {
  constructor(private db: PostgresJsDatabase<Record<string, never>>) {}

  async createUser(user: User): Promise<User> {
    const rawUserData = UserMapper.toPersistence(user)
    const result = await this.db
      .insert(schemas.userTable)
      .values(rawUserData)
      .returning()
    return result.map((u) => UserMapper.toDomain(u))[0]
  }

  async readUserList(): Promise<UserList> {
    const result = await this.db.select().from(schemas.userTable)
    return result.map((u) => UserMapper.toDomain(u))
  }

  async readUser(userId: string): Promise<User> {
    const result = await this.db
      .select()
      .from(schemas.userTable)
      .where(eq(schemas.userTable.id, userId))
    return result.map((u) => UserMapper.toDomain(u))[0]
  }

  async updateUser(userId: string, user: User): Promise<User> {
    const result = await this.db
      .update(schemas.userTable)
      .set({ name: user.name, email: user.email })
      .where(eq(schemas.userTable.id, userId))
      .returning()
    return result.map((u) => UserMapper.toDomain(u))[0]
  }

  async deleteUser(userId: string): Promise<User> {
    const result = await this.db
      .delete(schemas.userTable)
      .where(eq(schemas.userTable.id, userId))
      .returning()
    return result.map((u) => UserMapper.toDomain(u))[0]
  }
}

export { IUserRepository, UserRepository }
