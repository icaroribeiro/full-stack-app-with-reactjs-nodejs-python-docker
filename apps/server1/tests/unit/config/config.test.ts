import { describe, expect, it, beforeEach } from 'vitest'
import { Config } from '../../../src/config/config'
import { faker } from '@faker-js/faker'
import { afterEach } from 'node:test'
import { ServerError } from '../../../src/server-error'
import httpStatus from 'http-status'
import { config } from '../../test-helpers'

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

  describe('.getEnv', () => {
    const varName = 'ENV'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
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

  describe('.getPort', () => {
    const varName = 'PORT'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.getPort).toBe('function')
    })

    it('should succeed and return environment variable when it is set', () => {
      const expectedResult = varValue

      const result = config.getPort()

      expect(result).toEqual(expectedResult)
    })

    it('should fail and throw exception when environment variable is not set', () => {
      delete process.env[varName]
      const message = `${varName} environment variable isn't set`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => config.getPort()).toThrowError(serverError)
    })
  })

  describe('.getDatabaseURL', () => {
    const varName = 'DATABASE_URL'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.getDatabaseURL).toBe('function')
    })

    it('should succeed and return environment variable when it is set', () => {
      const expectedResult = varValue

      const result = config.getDatabaseURL()

      expect(result).toEqual(expectedResult)
    })

    it('should fail and throw exception when environment variable is not set', () => {
      delete process.env[varName]
      const message = `${varName} environment variable isn't set`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => config.getDatabaseURL()).toThrowError(serverError)
    })
  })

  describe('.getDatabaseUser', () => {
    const varName = 'DATABASE_USER'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.getDatabaseUser).toBe('function')
    })

    it('should succeed and return environment variable when it is set', () => {
      const expectedResult = varValue

      const result = config.getDatabaseUser()

      expect(result).toEqual(expectedResult)
    })

    it('should fail and throw exception when environment variable is not set', () => {
      delete process.env[varName]
      const message = `${varName} environment variable isn't set`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => config.getDatabaseUser()).toThrowError(serverError)
    })
  })

  describe('.getDatabasePassword', () => {
    const varName = 'DATABASE_PASSWORD'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.getDatabasePassword).toBe('function')
    })

    it('should succeed and return environment variable when it is set', () => {
      const expectedResult = varValue

      const result = config.getDatabasePassword()

      expect(result).toEqual(expectedResult)
    })

    it('should fail and throw exception when environment variable is not set', () => {
      delete process.env[varName]
      const message = `${varName} environment variable isn't set`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => config.getDatabasePassword()).toThrowError(serverError)
    })
  })

  describe('.getDatabaseName', () => {
    const varName = 'DATABASE_NAME'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.getDatabaseName).toBe('function')
    })

    it('should succeed and return environment variable when it is set', () => {
      const expectedResult = varValue

      const result = config.getDatabaseName()

      expect(result).toEqual(expectedResult)
    })

    it('should fail and throw exception when environment variable is not set', () => {
      delete process.env[varName]
      const message = `${varName} environment variable isn't set`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => config.getDatabaseName()).toThrowError(serverError)
    })
  })

  describe('.getDatabasePort', () => {
    const varName = 'DATABASE_PORT'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.getDatabasePort).toBe('function')
    })

    it('should succeed and return environment variable when it is set', () => {
      const expectedResult = varValue

      const result = config.getDatabasePort()

      expect(result).toEqual(expectedResult)
    })

    it('should fail and throw exception when environment variable is not set', () => {
      delete process.env[varName]
      const message = `${varName} environment variable isn't set`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => config.getDatabasePort()).toThrowError(serverError)
    })
  })

  describe('.getAllowedOrigins', () => {
    const varName = 'ALLOWED_ORIGINS'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.getAllowedOrigins).toBe('function')
    })

    it('should succeed and return environment variable when it is set', () => {
      const expectedResult = varValue

      const result = config.getAllowedOrigins()

      expect(result).toEqual(expectedResult)
    })

    it('should fail and throw exception when environment variable is not set', () => {
      delete process.env[varName]
      const message = `${varName} environment variable isn't set`
      const serverError = new ServerError(
        message,
        httpStatus.INTERNAL_SERVER_ERROR,
      )

      expect(() => config.getAllowedOrigins()).toThrowError(serverError)
    })
  })

  describe('.setDataseURL', () => {
    const varName = 'DATABASE_URL'

    beforeEach(() => {
      const result = setup(varName, faker.string.alphanumeric(5))
      exists = result.exists
      varValue = result.varValue
    })

    afterEach(() => {
      teardown(varName, varValue, exists)
    })

    it('should define a function', () => {
      expect(typeof config.setDataseURL).toBe('function')
    })

    it('should succeed and return void when environment variable is set', () => {
      const varValue = faker.string.alphanumeric(5)

      const result = config.setDataseURL(varValue)

      expect(result).toBe(void 0)
      expect(process.env[varName]).toEqual(varValue)
    })
  })
})
