type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  headers?: HeadersInit
}

export function useApiRequest() {
  const config = useRuntimeConfig()
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch

  return async function apiRequest<TResponse, TBody extends BodyInit | object | null = Record<string, unknown>>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const response = await requestFetch(path, {
      baseURL: config.public.apiBase,
      method: options.method,
      body: options.body,
      headers: options.headers,
      credentials: 'include',
    })

    return response as TResponse
  }
}
