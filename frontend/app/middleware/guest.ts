export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, ensureSession } = useAuth()

  await ensureSession()

  if (isAuthenticated.value) {
    return navigateTo('/users/me')
  }
})
