import type { AdminEventDetail, AdminEventPayload } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing event id',
    })
  }

  const body = await readBody<Partial<AdminEventPayload>>(event)

  return proxyBackendRequest<AdminEventDetail, Partial<AdminEventPayload>>(event, `/events/${id}`, {
    method: 'PATCH',
    body,
  })
})
