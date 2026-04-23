import type { UserRole } from '~~/shared/types'

function buildAdminAuthHeaders(accessToken: string | null): HeadersInit {
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing access token',
    })
  }

  return {
    authorization: `Bearer ${accessToken}`,
  }
}

export function useAdminApi() {
  const { accessToken } = useAuth()
  const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()

  function requireAdminHeaders(): HeadersInit {
    return buildAdminAuthHeaders(accessToken.value)
  }

  function normalizeAdminError(error: unknown, fallback: string): never {
    throw createError({
      statusCode: getApiErrorStatus(error) ?? 500,
      statusMessage: getApiErrorMessage(error, fallback),
      data: error,
    })
  }

  const roleOptions: Array<{ value: UserRole, label: string }> = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'CREATOR', label: 'Creador' },
    { value: 'VALIDATOR', label: 'Validador' },
    { value: 'BUYER', label: 'Comprador' },
  ]

  return {
    roleOptions,
    requireAdminHeaders,
    normalizeAdminError,
  }
}
