type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  headers?: HeadersInit
}

export function useApiRequest() {
  const config = useRuntimeConfig()

  return async function apiRequest<TResponse, TBody extends BodyInit | object | null = Record<string, unknown>>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const response = await $fetch.raw(path, {
      baseURL: config.public.apiBase,
      method: options.method,
      body: options.body,
      headers: options.headers,
      credentials: 'include',
    })

    return response._data as TResponse
  }
}
