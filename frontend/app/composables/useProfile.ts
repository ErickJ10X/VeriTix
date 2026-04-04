import type { ChangePasswordRequest, UpdateProfileRequest, UserProfile } from '~~/shared/types'

function buildAuthHeaders(accessToken: string | null): HeadersInit {
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

export function useProfile() {
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<UserProfile | null>('auth-user', () => null)
  const pending = useState<boolean>('profile-pending', () => false)

  const apiRequest = useApiRequest()

  async function fetchProfile(): Promise<UserProfile> {
    pending.value = true

    try {
      const profile = await apiRequest<UserProfile>('/users/me', {
        method: 'GET',
        headers: buildAuthHeaders(accessToken.value),
      })

      user.value = profile

      return profile
    }
    finally {
      pending.value = false
    }
  }

  async function updateProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    pending.value = true

    try {
      const profile = await apiRequest<UserProfile, UpdateProfileRequest>('/users/me', {
        method: 'PATCH',
        body: payload,
        headers: buildAuthHeaders(accessToken.value),
      })

      user.value = profile

      return profile
    }
    finally {
      pending.value = false
    }
  }

  async function changePassword(payload: ChangePasswordRequest): Promise<void> {
    pending.value = true

    try {
      await apiRequest<void, ChangePasswordRequest>('/users/me/password', {
        method: 'PATCH',
        body: payload,
        headers: buildAuthHeaders(accessToken.value),
      })
    }
    finally {
      pending.value = false
    }
  }

  return {
    user,
    pending,
    fetchProfile,
    updateProfile,
    changePassword,
  }
}
