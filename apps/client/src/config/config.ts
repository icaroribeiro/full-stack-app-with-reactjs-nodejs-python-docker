import { ClientError } from '../client-error'

class Config {
  public getAPIURL(): string {
    return this.getEnvVar('VITE_API_URL')
  }

  public getGetMethodRequestTimeout(): string {
    return this.getEnvVar('VITE_GET_METHOD_REQUEST_TIMEOUT')
  }

  private getEnvVar(name: string): string {
    if (!import.meta.env[name]) {
      const message = `${name} environment variable isn't set`
      throw new ClientError(message)
    }
    return import.meta.env[name]
  }
}

const config = new Config()
export { config }
