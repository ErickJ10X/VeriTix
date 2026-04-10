import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing event id',
    })
  }

  return proxyBackendRequest<unknown>(event, `/events/${id}`, {
    method: 'DELETE',
  })
})
