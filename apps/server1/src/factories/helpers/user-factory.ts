/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker'

import { User, UserList, UserMapper } from '../../api/components/user'

class UserFactory {
  public build(): User {
    return UserMapper.toDomain(this.createUser())
  }

  public buildMany(count: number = 1): UserList {
    return faker.helpers.multiple<User>(this.createUser, {
      count: count,
    })
  }

  private createUser(): any {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    }
  }
}

export { UserFactory }
