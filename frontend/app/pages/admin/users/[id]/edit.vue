<script setup lang="ts">
import type {
  AdminUpdateUserPayload,
  AdminUserRecord,
} from '~/types'
import { useAdminUsersRepository } from '~/repositories/adminUsersRepository'
import { hasUserSemanticChanges, normalizeUpdateUserPayload } from '~/utils/admin/formSafeRails'

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
const infoMessage = ref('')
const totalRoles = computed(() => roleOptions.length)

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
  if (submitting.value || !user.value) {
    return
  }

  const normalizedPayload = normalizeUpdateUserPayload(payload)

  if (!hasUserSemanticChanges(user.value, normalizedPayload)) {
    errorMessage.value = ''
    successMessage.value = ''
    infoMessage.value = 'No hay cambios para guardar.'
    return
  }

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  infoMessage.value = ''

  try {
    user.value = await updateAdminUser(userId.value, normalizedPayload)

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
    description="Actualiza perfil, permisos y estado de acceso del usuario."
    primary-action-to="/admin/users"
    primary-action-label="Volver a usuarios"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="infoMessage" tone="info" :message="infoMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <AdminOverviewPanel
        title="Datos del usuario"
        description="Edita contacto, rol, estado y verificación de cuenta."
        tone="subtle"
      >
        <template #actions>
          <div v-if="user" class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ totalRoles }} roles
            </BaseBadge>
            <BaseBadge kind="status" :color="user.isActive ? 'success' : 'neutral'" size="sm" class="min-w-24 justify-center">
              {{ user.isActive ? 'ACTIVO' : 'INACTIVO' }}
            </BaseBadge>
            <BaseBadge kind="status" :color="user.emailVerified ? 'success' : 'warning'" size="sm" class="min-w-24 justify-center">
              {{ user.emailVerified ? 'VERIFICADO' : 'PENDIENTE' }}
            </BaseBadge>
          </div>
        </template>

        <template v-if="loading">
          <div class="space-y-4">
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
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
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
