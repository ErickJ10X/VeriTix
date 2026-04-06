import type { PaginatedResponse, VenueOption } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { defineAnonymousCachedEventHandler } from '~~/server/utils/public-api-cache'

export default defineAnonymousCachedEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<VenueOption>>(event, '/venues', {
    method: 'GET',
    query: {
      page: 1,
      limit: 100,
      isActive: true,
    },
  })
}, {
  getKey: () => 'venues:page=1:limit=100:isActive=true',
  maxAge: 1800,
  staleMaxAge: 21600,
})
