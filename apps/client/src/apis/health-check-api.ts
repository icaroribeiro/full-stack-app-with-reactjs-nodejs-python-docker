import httpClient from '../shared/http-client'

const healthCheckAPI = {
  get: async function () {
    const response = await httpClient.request({
      url: '/health',
      method: 'GET',
    })
    return response.data
  },
}

export { healthCheckAPI }
