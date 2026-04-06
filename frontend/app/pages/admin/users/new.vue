<script setup lang="ts">
import type { AdminCreateUserPayload, AdminUpdateUserPayload } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Nuevo usuario admin | VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

const creationSurface = {
  eyebrow: 'Alta manual',
  title: 'Abre una cuenta con criterio operativo',
  description: 'Crea usuarios nuevos con rol inicial, datos de acceso y una presentación más clara para el equipo admin.',
  icon: 'i-lucide-user-round-plus',
  accentClass: 'from-cyan',
  highlights: ['Identidad completa', 'Rol inicial', 'Acceso seguro', 'Paso directo a edición'],
} as const

async function loadPage() {
  loading.value = true

  try {
    await ensureAdminSession()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos abrir el alta de usuario.')
  }
  finally {
    loading.value = false
  }
}

async function createUser(payload: AdminCreateUserPayload | AdminUpdateUserPayload) {
  submitting.value = true
  errorMessage.value = ''

  try {
    if (!('password' in payload)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La creación de usuarios requiere contraseña.',
      })
    }

    const created = await apiRequest<{ id: string }, AdminCreateUserPayload>('/admin/users', {
      method: 'POST',
      headers: requireAdminHeaders(),
      body: payload,
    })

    await navigateTo(`/admin/users/${created.id}/edit`)
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos crear el usuario.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadPage()
})
</script>

<template>
  <AdminPageShell title="Crear usuario" description="Alta manual de cuentas y asignación inicial de rol.">
    <div class="space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-14 rounded-2xl" />
        <USkeleton class="h-36 rounded-2xl" />
      </div>

      <AdminFormSurface
        v-else
        :eyebrow="creationSurface.eyebrow"
        :title="creationSurface.title"
        :description="creationSurface.description"
        :icon="creationSurface.icon"
        :accent-class="creationSurface.accentClass"
        :highlights="creationSurface.highlights"
      >
        <AdminUserForm mode="create" :submitting="submitting" submit-label="Crear usuario" @submit="createUser" />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
