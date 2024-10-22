import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import httpStatus from 'http-status'
import { toast } from 'react-toastify'

import { config } from '../../config/config'

class AxiosInterceptor {
  public setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
    axiosInstance.interceptors.request.use(this.onRequest, this.onErrorResponse)
    axiosInstance.interceptors.response.use(
      this.onResponse,
      this.onErrorResponse,
    )
    return axiosInstance
  }

  private onRequest(
    reqConfig: InternalAxiosRequestConfig,
  ): InternalAxiosRequestConfig {
    const { method, url } = reqConfig
    // Set headers here
    // Check authentication here
    console.log(`[API] ${method?.toUpperCase()} ${url} | Request`)

    if (method?.toUpperCase() === 'GET') {
      reqConfig.timeout = parseInt(config.getGetMethodRequestTimeout())
    }
    return reqConfig
  }

  private onResponse(response: AxiosResponse): AxiosResponse {
    const { method, url } = response.config
    const { status } = response
    // Set loading end here
    // Handle response data here
    // Handle error when returning success with error code here
    console.log(`[API] ${method?.toUpperCase()} ${url} | Response ${status}`)
    return response
  }

  private onErrorResponse(error: AxiosError | Error): Promise<AxiosError> {
    if (axios.isAxiosError(error)) {
      const { message } = error
      const { method, url } = error.config as AxiosRequestConfig
      const { status } = (error.response as AxiosResponse) ?? {}

      console.log(
        `[API] ${method?.toUpperCase()} ${url} | Error ${status} ${message}`,
      )

      switch (status) {
        case httpStatus.INTERNAL_SERVER_ERROR: {
          break
        }
        default: {
          break
        }
      }
    } else {
      console.log(`[API] | Error ${error.message}`)
    }
    toast.error(`${error}`)
    return Promise.reject(error)
  }
}

const axiosInterceptor = new AxiosInterceptor()
export { axiosInterceptor }
