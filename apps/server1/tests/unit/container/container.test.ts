import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { DBContainerTestFactory } from '../../factories/db-container-factory'
import { ContainerService } from '../../container/container-service'

describe('ContainerService', () => {
  const factory: DBContainerTestFactory = new DBContainerTestFactory()

  beforeAll(async () => {
    await factory.prepareAll()
  }, factory.beforeAllTimeout)

  afterEach(async () => {
    await factory.closeEach()
  })

  afterAll(async () => {
    await factory.closeAll()
  })

  describe('contructor', () => {
    it('should succeed and register database container', () => {
      const listOfTokens: string[] = ['DBService']
      const expectedResult = true

      const containerService = new ContainerService()
      const result = containerService.container

      for (const token of listOfTokens) {
        expect(result.isRegistered(token)).toEqual(expectedResult)
      }
    })

    it('should succeed and register repository container', () => {
      const listOfTokens: string[] = ['UserRepository']
      const expectedResult = true

      const containerService = new ContainerService()
      const result = containerService.container

      for (const token of listOfTokens) {
        expect(result.isRegistered(token)).toEqual(expectedResult)
      }
    })

    it('should succeed and register service container', () => {
      const listOfTokens: string[] = ['HealthCheckService', 'UserService']
      const expectedResult = true

      const containerService = new ContainerService()
      const result = containerService.container

      for (const token of listOfTokens) {
        expect(result.isRegistered(token)).toEqual(expectedResult)
      }
    })
  })

  describe('.container', () => {
    it('should define an object', () => {
      const containerService = new ContainerService()

      expect(typeof containerService.container).toBe('object')
    })
  })
})
