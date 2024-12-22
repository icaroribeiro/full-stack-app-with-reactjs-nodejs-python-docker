/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker'

import { UserModel } from '../../db/schemas'

class UserFactory {
  public build(): UserModel {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      createdAt: faker.date.anytime(),
      updatedAt: faker.date.anytime(),
    }
  }

  public buildBatch(count: number = 1): UserModel[] {
    return faker.helpers.multiple<UserModel>(this.build, {
      count: count,
    })
  }
}

export { UserFactory }
