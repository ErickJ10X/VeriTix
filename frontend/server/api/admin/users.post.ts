import type { AdminCreateUserPayload, AdminUserRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<AdminCreateUserPayload>(event)

  return proxyBackendRequest<AdminUserRecord, AdminCreateUserPayload>(event, '/users', {
    method: 'POST',
    body,
  })
})
