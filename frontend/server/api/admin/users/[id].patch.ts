import type { AdminUpdateUserPayload, AdminUserRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user id',
    })
  }

  const body = await readBody<AdminUpdateUserPayload>(event)

  return proxyBackendRequest<AdminUserRecord, AdminUpdateUserPayload>(event, `/users/${id}`, {
    method: 'PATCH',
    body,
  })
})
