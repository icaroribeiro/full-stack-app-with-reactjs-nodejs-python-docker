import { Detail } from '../../server-error'

type APIErrorResponse = {
  message: string
  detail?: Detail
  isOperational: boolean
}

export { APIErrorResponse }
