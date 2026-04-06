type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

type ApiQueryValue = string | number | boolean | undefined

interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  headers?: HeadersInit
  query?: Record<string, ApiQueryValue>
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

    const apiUrl = `${import.meta.server ? useRequestURL().origin : window.location.origin}${config.public.apiBase}${path}`

    const response: unknown = await $fetch(apiUrl, {
      method: options.method,
      body: options.body,
      headers,
      query: options.query,
      credentials: 'include' as const,
    })

    return response as TResponse
  }
}
