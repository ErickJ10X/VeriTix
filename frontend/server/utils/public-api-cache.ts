import type { H3Event } from 'h3'
import { defineEventHandler, getHeader, setResponseHeader } from 'h3'

interface PublicApiCacheOptions {
  getKey: (event: H3Event) => string
  maxAge: number
  staleMaxAge?: number
}

interface CachedResponseEntry<TResponse> {
  expiresAt: number
  value: TResponse
}

const publicApiCache = new Map<string, CachedResponseEntry<unknown>>()

function hasAuthContext(event: H3Event): boolean {
  return Boolean(getHeader(event, 'authorization') || getHeader(event, 'cookie'))
}

function setPublicCacheControlHeader(event: H3Event, options: PublicApiCacheOptions): void {
  const directives = [`public`, `s-maxage=${options.maxAge}`]

  if (options.staleMaxAge && options.staleMaxAge > 0) {
    directives.push(`stale-while-revalidate=${options.staleMaxAge}`)
  }

  setResponseHeader(event, 'cache-control', directives.join(', '))
}

function setNoStoreHeader(event: H3Event): void {
  setResponseHeader(event, 'cache-control', 'no-store')
}

export function defineAnonymousCachedEventHandler<TResponse>(
  handler: (event: H3Event) => Promise<TResponse>,
  options: PublicApiCacheOptions,
) {
  return defineEventHandler(async (event) => {
    if (hasAuthContext(event)) {
      setNoStoreHeader(event)
      return handler(event)
    }

    setPublicCacheControlHeader(event, options)

    const storageKey = `veritix:public-api:${options.getKey(event)}`
    const cachedEntry = publicApiCache.get(storageKey) as CachedResponseEntry<TResponse> | undefined

    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return cachedEntry.value
    }

    if (cachedEntry) {
      publicApiCache.delete(storageKey)
    }

    const response = await handler(event)

    if (typeof response !== 'undefined') {
      publicApiCache.set(storageKey, {
        expiresAt: Date.now() + options.maxAge * 1000,
        value: response,
      })
    }

    return response
  })
}
