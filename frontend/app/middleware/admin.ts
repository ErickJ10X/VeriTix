export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const { ensureSession, isAuthenticated, user } = useAuth()

  await ensureSession()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  if (user.value?.role !== 'ADMIN') {
    return navigateTo('/users/me')
  }
})
