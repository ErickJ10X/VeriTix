import type { ApiErrorPayload } from '~~/shared/types'

interface FetchLikeError {
  message?: string
  data?: ApiErrorPayload
}

export function useApiErrorMessage() {
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
    getApiErrorMessage,
  }
}
