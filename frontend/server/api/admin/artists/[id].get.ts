import type { AdminArtistRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing artist id',
    })
  }

  return proxyBackendRequest<AdminArtistRecord>(event, `/artists/${id}`, {
    method: 'GET',
  })
})
