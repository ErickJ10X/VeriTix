import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing artist id',
    })
  }

  return proxyBackendRequest<unknown>(event, `/artists/${id}`, {
    method: 'DELETE',
  })
})
