import axios from 'axios'

import { config } from '../config/config'
import { axiosInterceptor } from '../libs/axios/interceptor'

const instance = axios.create({
  baseURL: config.getAPIURL(),
  headers: {
    'Content-type': 'application/json',
  },
})

export default axiosInterceptor.setupInterceptorsTo(instance)
