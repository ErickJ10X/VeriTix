interface NotifyOptions {
  id?: string
  title?: string
  duration?: number
}

export function useAppNotifications() {
  const toast = useToast()
  const { getApiErrorMessage, isApiAuthError } = useApiErrorMessage()
  const { clearAuth } = useAuth()

  function notifyError(description: string, options: NotifyOptions = {}) {
    toast.add({
      id: options.id,
      title: options.title ?? 'No se pudo completar',
      description,
      color: 'error',
      icon: 'i-lucide-alert-circle',
      duration: options.duration,
    })
  }

  function notifySuccess(description: string, options: NotifyOptions = {}) {
    toast.add({
      id: options.id,
      title: options.title ?? 'Listo',
      description,
      color: 'success',
      icon: 'i-lucide-check-circle',
      duration: options.duration,
    })
  }

  function notifyInfo(description: string, options: NotifyOptions = {}) {
    toast.add({
      id: options.id,
      title: options.title ?? 'Información',
      description,
      color: 'info',
      icon: 'i-lucide-info',
      duration: options.duration,
    })
  }

  function notifyApiError(error: unknown, fallback: string, options: NotifyOptions = {}) {
    if (isApiAuthError(error) && import.meta.client) {
      clearAuth()
      toast.add({
        id: options.id ?? 'auth-session-expired',
        title: 'Sesión expirada',
        description: 'Volvé a iniciar sesión para continuar.',
        color: 'warning',
        icon: 'i-lucide-log-in',
        duration: options.duration ?? 6000,
      })
      void navigateTo('/login')
      return
    }

    notifyError(getApiErrorMessage(error, fallback), options)
  }

  return {
    notifyError,
    notifySuccess,
    notifyInfo,
    notifyApiError,
  }
}
