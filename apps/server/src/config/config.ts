import { INTERNAL_SERVER_ERROR } from 'http-status'

import { ServerError } from '../api/server.error'

class Config {
  public getPort(): string {
    return this.getEnvVar('PORT')
  }

  public getDatabaseURL(): string {
    return this.getEnvVar('DATABASE_URL')
  }

  public getDatabaseUser(): string {
    return this.getEnvVar('DATABASE_USER')
  }

  public getDatabasePassword(): string {
    return this.getEnvVar('DATABASE_PASSWORD')
  }

  public getDatabaseName(): string {
    return this.getEnvVar('DATABASE_NAME')
  }

  public getDatabasePort(): string {
    return this.getEnvVar('DATABASE_PORT')
  }

  private getEnvVar(name: string): string {
    if (!process.env[name]) {
      const message = `${name} environment variable isn't set`
      throw new ServerError(message, INTERNAL_SERVER_ERROR)
    }
    return process.env[name]
  }
}

const config = new Config()
export { config }
