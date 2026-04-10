import type { AdminUserRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user id',
    })
  }

  return proxyBackendRequest<AdminUserRecord>(event, `/users/${id}`, {
    method: 'GET',
  })
})
