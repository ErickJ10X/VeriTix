export default defineNuxtPlugin(async () => {
  const { ensureSession } = useAuth()

  await ensureSession()
})
