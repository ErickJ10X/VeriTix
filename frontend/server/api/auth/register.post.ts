import type { AuthResponse, RegisterRequest } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterRequest>(event)

  return proxyBackendRequest<AuthResponse, RegisterRequest>(event, '/auth/register', {
    method: 'POST',
    body,
  })
})
