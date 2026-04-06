import type { GenreOption } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { defineAnonymousCachedEventHandler } from '~~/server/utils/public-api-cache'

export default defineAnonymousCachedEventHandler(async (event) => {
  return proxyBackendRequest<GenreOption[]>(event, '/genres', {
    method: 'GET',
  })
}, {
  getKey: () => 'genres',
  maxAge: 3600,
  staleMaxAge: 86400,
})
