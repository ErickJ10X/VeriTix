import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '~~/shared/types'

function buildAuthHeaders(accessToken: string | null): HeadersInit | undefined {
  if (!accessToken) {
    return undefined
  }

  return {
    authorization: `Bearer ${accessToken}`,
  }
}

export function useAuth() {
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<UserProfile | null>('auth-user', () => null)
  const pending = useState<boolean>('auth-pending', () => false)

  const apiRequest = useApiRequest()

  const isAuthenticated = computed(() => {
    return Boolean(accessToken.value && user.value)
  })

  function applyAuth(response: AuthResponse): AuthResponse {
    accessToken.value = response.accessToken
    user.value = response.user
    return response
  }

  function clearAuth(): void {
    accessToken.value = null
    user.value = null
  }

  async function register(payload: RegisterRequest): Promise<AuthResponse> {
    pending.value = true

    try {
      const response = await apiRequest<AuthResponse, RegisterRequest>('/auth/register', {
        method: 'POST',
        body: payload,
      })

      return applyAuth(response)
    }
    finally {
      pending.value = false
    }
  }

  async function login(payload: LoginRequest): Promise<AuthResponse> {
    pending.value = true

    try {
      const response = await apiRequest<AuthResponse, LoginRequest>('/auth/login', {
        method: 'POST',
        body: payload,
      })

      return applyAuth(response)
    }
    finally {
      pending.value = false
    }
  }

  async function refreshSession(): Promise<AuthResponse | null> {
    try {
      const response = await apiRequest<AuthResponse>('/auth/refresh', {
        method: 'POST',
        headers: buildAuthHeaders(accessToken.value),
      })

      return applyAuth(response)
    }
    catch {
      clearAuth()
      return null
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
        headers: buildAuthHeaders(accessToken.value),
      })
    }
    finally {
      clearAuth()
    }
  }

  return {
    accessToken,
    user,
    pending,
    isAuthenticated,
    register,
    login,
    refreshSession,
    logout,
    clearAuth,
  }
}
