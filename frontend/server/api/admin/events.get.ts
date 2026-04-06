import type { AdminEventRecord, PaginatedResponse } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return proxyBackendRequest<PaginatedResponse<AdminEventRecord>>(event, '/events', {
    method: 'GET',
    query: {
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
      search: typeof query.search === 'string' ? query.search : undefined,
    },
  })
})
