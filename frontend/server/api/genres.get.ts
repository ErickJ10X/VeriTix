import type { GenreOption } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<GenreOption[]>(event, '/genres', {
    method: 'GET',
  })
})
