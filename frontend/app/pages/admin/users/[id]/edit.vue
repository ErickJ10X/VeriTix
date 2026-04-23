<script setup lang="ts">
import type {
  AdminUpdateUserPayload,
  AdminUserRecord,
} from '~/types'
import { useAdminUsersRepository } from '~/repositories/adminUsersRepository'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Editar usuario | Admin VeriTix' })

const route = useRoute()
const userId = computed(() => String(route.params.id || ''))

const { getUser: getAdminUser, updateUser: updateAdminUser } = useAdminUsersRepository()
const { roleOptions } = useAdminApi()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()

const user = ref<AdminUserRecord | null>(null)
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function loadUser() {
  loading.value = true
  errorMessage.value = ''

  try {
    user.value = await getAdminUser(userId.value)
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuario no encontrado.',
      })
    }

    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el usuario.')
  }
  finally {
    loading.value = false
  }
}

async function updateUser(payload: AdminUpdateUserPayload) {
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    user.value = await updateAdminUser(userId.value, payload)

    successMessage.value = 'Usuario actualizado correctamente.'
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos actualizar el usuario.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadUser()
})
</script>

<template>
  <AdminPageShell
    title="Editar usuario"
    description="Ajusta perfil, rol y estado de acceso de la cuenta seleccionada."
    primary-action-to="/admin/users"
    primary-action-label="Volver a usuarios"
  >
    <div class="mx-auto max-w-5xl space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <AdminFormSurface
        eyebrow="Usuarios"
        title="Configuración de cuenta"
        description="Actualiza datos de contacto, permisos y estado de verificación."
        icon="i-lucide-user-cog"
        variant="warning"
        :highlights="['roles de acceso', 'estado activo', 'verificación de email']"
      >
        <template v-if="loading">
          <div class="space-y-4">
            <USkeleton class="h-11 w-full rounded-lg" />
            <USkeleton class="h-11 w-full rounded-lg" />
            <USkeleton class="h-11 w-full rounded-lg" />
            <USkeleton class="h-11 w-full rounded-lg" />
          </div>
        </template>

        <AdminUserForm
          v-else-if="user"
          :initial-value="user"
          :role-options="roleOptions"
          :submitting="submitting"
          submit-label="Guardar cambios"
          :include-password="false"
          @submit="updateUser"
        />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
