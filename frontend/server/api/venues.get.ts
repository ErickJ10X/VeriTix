import type { PaginatedResponse, VenueOption } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<VenueOption>>(event, '/venues', {
    method: 'GET',
    query: {
      page: 1,
      limit: 100,
      isActive: true,
    },
  })
})
