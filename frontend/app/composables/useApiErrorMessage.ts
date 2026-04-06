import type { ApiErrorPayload } from '~~/shared/types'

interface FetchLikeError {
  message?: string
  statusCode?: number
  response?: {
    status?: number
  }
  data?: ApiErrorPayload
}

export function useApiErrorMessage() {
  function getApiErrorStatus(error: unknown): number | undefined {
    const fetchError = error as FetchLikeError
    return fetchError.response?.status ?? fetchError.statusCode ?? fetchError.data?.statusCode
  }

  function isApiAuthError(error: unknown): boolean {
    const status = getApiErrorStatus(error)
    return status === 401 || status === 403
  }

  function getApiErrorMessage(error: unknown, fallback: string): string {
    const fetchError = error as FetchLikeError
    const payload = fetchError.data

    if (Array.isArray(payload?.message)) {
      return payload.message.join(', ')
    }

    if (typeof payload?.message === 'string' && payload.message.length > 0) {
      return payload.message
    }

    if (payload?.error) {
      return payload.error
    }

    if (fetchError.message) {
      return fetchError.message
    }

    return fallback
  }

  return {
    getApiErrorStatus,
    getApiErrorMessage,
    isApiAuthError,
  }
}
