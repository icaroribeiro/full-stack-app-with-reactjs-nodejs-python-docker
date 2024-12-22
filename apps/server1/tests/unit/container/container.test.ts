import 'reflect-metadata'
import { describe, expect, it } from 'vitest'

import { Container } from '../../../src/container/container'

describe('Container', () => {
  describe('contructor', () => {
    it('should succeed when checking injection of dependencies', () => {
      const listOfTokens: string[] = [
        'DBService',
        'UserRepository',
        'HealthCheckService',
        'UserService',
        'APIPaginationService',
      ]
      const expectedResult = true

      const container = new Container()
      const result = container.container

      for (const token of listOfTokens) {
        expect(result.isRegistered(token)).toEqual(expectedResult)
      }
    })
  })

  describe('.container', () => {
    it('should define an object', () => {
      const container = new Container()

      expect(typeof container.container).toBe('object')
    })
  })
})
