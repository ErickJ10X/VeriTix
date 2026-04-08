import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user id',
    })
  }

  return proxyBackendRequest<unknown>(event, `/users/${id}`, {
    method: 'DELETE',
  })
})
