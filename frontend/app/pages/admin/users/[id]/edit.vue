<script setup lang="ts">
import type { AdminUpdateUserPayload, AdminUserRecord } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Editar usuario admin | VeriTix' })

const route = useRoute()
const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const userId = computed(() => String(route.params.id || ''))
const userRecord = ref<AdminUserRecord | null>(null)
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function loadUser() {
  loading.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    userRecord.value = await apiRequest<AdminUserRecord>(`/admin/users/${userId.value}`, {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el usuario.')
  }
  finally {
    loading.value = false
  }
}

async function updateUser(payload: AdminUpdateUserPayload) {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    userRecord.value = await apiRequest<AdminUserRecord, AdminUpdateUserPayload>(`/admin/users/${userId.value}`, {
      method: 'PATCH',
      headers: requireAdminHeaders(),
      body: payload,
    })
    successMessage.value = 'Usuario actualizado.'
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
  <AdminPageShell title="Editar usuario" description="Actualiza rol, estado y datos de contacto del usuario.">
    <div class="space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-14 rounded-2xl" />
        <USkeleton class="h-36 rounded-2xl" />
      </div>

      <div v-else-if="userRecord" class="rounded-3xl border border-default/55 bg-default/6 p-6">
        <AdminUserForm mode="edit" :initial-value="userRecord" :submitting="submitting" submit-label="Guardar cambios" @submit="updateUser" />
      </div>
    </div>
  </AdminPageShell>
</template>
