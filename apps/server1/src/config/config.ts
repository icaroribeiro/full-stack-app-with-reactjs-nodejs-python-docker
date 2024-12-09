import { INTERNAL_SERVER_ERROR } from 'http-status'

import { ServerError } from '../server-error'

class Config {
  public getNodeEnv(): string {
    return this.getEnvVar('NODE_ENV')
  }

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

  public getAllowedOrigins(): string {
    return this.getEnvVar('ALLOWED_ORIGINS')
  }

  public setDataseURL(databaseURL: string): void {
    process.env['DATABASE_URL'] = databaseURL
  }

  private getEnvVar(name: string): string {
    if (!process.env[name]) {
      const message = `${name} environment variable isn't set`
      throw new ServerError(message, INTERNAL_SERVER_ERROR)
    }
    return process.env[name]
  }
}

export { Config }
