import type { AdminArtistPayload, AdminArtistRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<AdminArtistPayload>(event)

  return proxyBackendRequest<AdminArtistRecord, AdminArtistPayload>(event, '/artists', {
    method: 'POST',
    body,
  })
})
