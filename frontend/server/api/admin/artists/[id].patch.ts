import type { AdminArtistPayload, AdminArtistRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing artist id',
    })
  }

  const body = await readBody<Partial<AdminArtistPayload>>(event)

  return proxyBackendRequest<AdminArtistRecord, Partial<AdminArtistPayload>>(event, `/artists/${id}`, {
    method: 'PATCH',
    body,
  })
})
