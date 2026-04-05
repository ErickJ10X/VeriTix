import type { EventCatalogDetail } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador del evento.' })
  }

  return proxyBackendRequest<EventCatalogDetail>(event, `/events/${id}`, {
    method: 'GET',
  })
})
