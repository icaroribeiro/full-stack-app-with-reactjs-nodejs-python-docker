/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker'

import { User, UserMapper } from '../../api/components/user'

class UserFactory {
  private user: any = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
  }

  public build(): User {
    return UserMapper.toDomain(this.user)
  }
}

export { UserFactory }
