import type { EventCatalogDetail } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { defineAnonymousCachedEventHandler } from '~~/server/utils/public-api-cache'

export default defineAnonymousCachedEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador del evento.' })
  }

  return proxyBackendRequest<EventCatalogDetail>(event, `/events/${id}`, {
    method: 'GET',
  })
}, {
  getKey: (event) => {
    return `event:${getRouterParam(event, 'id') ?? ''}`
  },
  maxAge: 120,
  staleMaxAge: 600,
})
