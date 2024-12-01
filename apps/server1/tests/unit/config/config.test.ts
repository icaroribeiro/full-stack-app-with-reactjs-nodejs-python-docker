import { describe, expect, it, beforeEach } from 'vitest'
import { Config } from '../../../src/config/config'
import { faker } from '@faker-js/faker'
import { afterEach } from 'node:test'
import { ServerError } from '../../../src/server-error'
import httpStatus from 'http-status'

function setup(varName: string, varValue: string): any {
  let exists = false
  if (process.env[varName]) {
    exists = true
    varValue = process.env[varName]
  } else {
    process.env[varName] = varValue
  }
  return { varValue, exists }
}

function teardown(varName: string, varValue: string, exists: boolean): void {
  if (exists) {
    process.env[varName] = varValue
  } else {
    if (process.env[varName]) {
      delete process.env[varName]
    }
  }
}

describe('Config', () => {
  let exists: boolean
  let varValue: string
  const config = new Config()

  describe('.getEnv', () => {
    const varName = 'ENV'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric())
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.getEnv).toBe('function')
    })

    it('should succeed and return environment variable when it is set', () => {
      const expectedResult = varValue

      const result = config.getEnv()

      expect(result).toEqual(expectedResult)
    })

    it('should fail and throw exception when environment variable is not set', () => {
      delete process.env[varName]
      const message = `${varName} environment variable isn't set`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => config.getEnv()).toThrowError(serverError)
    })
  })
})
