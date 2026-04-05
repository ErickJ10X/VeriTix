export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const { isAuthenticated, ensureSession } = useAuth()

  await ensureSession()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
