<script setup lang="ts">
import type {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  AdminUserRecord,
} from '~/types'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Nuevo usuario | Admin VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders, roleOptions } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const submitting = ref(false)
const errorMessage = ref('')

async function createUser(payload: AdminCreateUserPayload | AdminUpdateUserPayload) {
  submitting.value = true
  errorMessage.value = ''

  try {
    if (!('password' in payload)) {
      throw new Error('Payload inválido para crear usuario.')
    }

    await apiRequest<AdminUserRecord, AdminCreateUserPayload>('/admin/users', {
      method: 'POST',
      headers: requireAdminHeaders(),
      body: payload,
    })

    await navigateTo('/admin/users')
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos crear el usuario.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await ensureAdminSession()
})
</script>

<template>
  <AdminPageShell
    title="Nuevo usuario"
    description="Crea una cuenta nueva y define su rol operativo desde el panel admin."
    primary-action-to="/admin/users"
    primary-action-label="Volver a usuarios"
  >
    <div class="mx-auto max-w-5xl space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <AdminFormSurface
        eyebrow="Usuarios"
        title="Alta de usuario"
        description="Completa los datos básicos, asigna rol y define una contraseña segura para el primer acceso."
        icon="i-lucide-user-plus"
        variant="primary"
        :highlights="['correo único', 'rol operativo', 'credenciales seguras']"
      >
        <AdminUserForm
          :role-options="roleOptions"
          :submitting="submitting"
          submit-label="Crear usuario"
          :include-password="true"
          @submit="createUser"
        />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
