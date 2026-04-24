<script setup lang="ts">
import type {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
} from '~/types'
import { useAdminUsersRepository } from '~/repositories/adminUsersRepository'
import { normalizeCreateUserPayload } from '~/utils/admin/formSafeRails'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Nuevo usuario | Admin VeriTix' })

const { createUser: createAdminUser } = useAdminUsersRepository()
const { roleOptions } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const submitting = ref(false)
const errorMessage = ref('')
const totalRoles = computed(() => roleOptions.length)

async function createUser(payload: AdminCreateUserPayload | AdminUpdateUserPayload) {
  if (submitting.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    if (!('password' in payload)) {
      throw new Error('Payload inválido para crear usuario.')
    }

    await createAdminUser(normalizeCreateUserPayload(payload))

    await navigateTo('/admin/users')
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos crear el usuario.')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <AdminPageShell
    title="Nuevo usuario"
    description="Crea una cuenta y asigna su rol operativo."
    primary-action-to="/admin/users"
    primary-action-label="Volver a usuarios"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <AdminOverviewPanel
        title="Datos del usuario"
        description="Completa identidad, contacto, rol y contraseña inicial."
        tone="subtle"
      >
        <template #actions>
          <div class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ totalRoles }} roles
            </BaseBadge>
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              acceso inicial
            </BaseBadge>
          </div>
        </template>

        <AdminUserForm
          :role-options="roleOptions"
          :submitting="submitting"
          submit-label="Crear usuario"
          :include-password="true"
          @submit="createUser"
        />
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
