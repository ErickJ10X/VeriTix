import type { AdminUserRecord, PaginatedResponse } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return proxyBackendRequest<PaginatedResponse<AdminUserRecord>>(event, '/users', {
    method: 'GET',
    query: {
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
      search: typeof query.search === 'string' ? query.search : undefined,
      role: typeof query.role === 'string' ? query.role : undefined,
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
    },
  })
})
