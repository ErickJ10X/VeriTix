type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

type ApiQueryValue = string | number | boolean | undefined

const TRAILING_SLASH_REGEX = /\/$/

interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  headers?: HeadersInit
  query?: Record<string, ApiQueryValue>
  timeoutMs?: number
}

export function useApiRequest() {
  const config = useRuntimeConfig()

  return async function apiRequest<TResponse, TBody extends BodyInit | object | null = Record<string, unknown>>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const headers = new Headers(options.headers)

    if (import.meta.server) {
      const requestHeaders = useRequestHeaders(['authorization', 'cookie'])

      if (requestHeaders.authorization && !headers.has('authorization')) {
        headers.set('authorization', requestHeaders.authorization)
      }

      if (requestHeaders.cookie && !headers.has('cookie')) {
        headers.set('cookie', requestHeaders.cookie)
      }
    }

    const origin = import.meta.server ? useRequestURL().origin : window.location.origin
    const apiBaseUrl = new URL(config.public.apiBase, origin).toString().replace(TRAILING_SLASH_REGEX, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const apiUrl = `${apiBaseUrl}${normalizedPath}`
    const configuredTimeout = Number(config.public.apiTimeoutMs ?? 8000)
    const timeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : 8000

    const response: unknown = await $fetch(apiUrl, {
      method: options.method,
      body: options.body,
      headers,
      query: options.query,
      credentials: 'include' as const,
      retry: 0,
      timeout: options.timeoutMs ?? timeout,
    })

    return response as TResponse
  }
}
