import type { AdminEventDetail, AdminEventPayload } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<AdminEventPayload>(event)

  return proxyBackendRequest<AdminEventDetail, AdminEventPayload>(event, '/events', {
    method: 'POST',
    body,
  })
})
