<script setup lang="ts">
import type { AdminUserRecord, PaginatedResponse } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Admin usuarios | VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const users = ref<AdminUserRecord[]>([])
const pending = ref(true)
const errorMessage = ref('')
const deletingUserId = ref('')

async function loadUsers() {
  pending.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    const response = await apiRequest<PaginatedResponse<AdminUserRecord>>('/admin/users', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: { page: 1, limit: 50 },
    })
    users.value = response.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los usuarios.')
  }
  finally {
    pending.value = false
  }
}

async function removeUser(userId: string) {
  deletingUserId.value = userId
  try {
    await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })
    await loadUsers()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el usuario.')
  }
  finally {
    deletingUserId.value = ''
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <AdminPageShell
    title="Usuarios admin"
    description="Gestión de cuentas, roles y estado operativo de usuarios."
    primary-action-to="/admin/users/new"
    primary-action-label="Crear usuario"
  >
    <div class="space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
        <USkeleton v-for="index in 4" :key="index" class="h-44 rounded-3xl" />
      </div>

      <div v-else-if="users.length === 0" class="vtx-admin-empty">
        No hay usuarios disponibles todavía.
      </div>

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <article v-for="entry in users" :key="entry.id" class="vtx-admin-list-card">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="soft">
                {{ entry.role }}
              </UBadge>
              <span class="text-xs" :class="entry.isActive ? 'text-success' : 'text-error'">
                {{ entry.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <h2 class="text-lg font-semibold text-highlighted">
              {{ entry.name }} {{ entry.lastName }}
            </h2>
            <p class="text-sm text-toned">
              {{ entry.email }}
            </p>
            <p class="text-sm text-dimmed">
              {{ entry.phone }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <BaseSecondaryButton :to="`/admin/users/${entry.id}/edit`" size="sm">
              Editar
            </BaseSecondaryButton>
            <AdminDeleteAction
              :item-label="`${entry.name} ${entry.lastName}`.trim()"
              :pending="deletingUserId === entry.id"
              @confirm="removeUser(entry.id)"
            />
          </div>
        </article>
      </div>
    </div>
  </AdminPageShell>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-admin-list-card,
.vtx-admin-empty {
  @apply rounded-3xl border p-6;
  border-color: rgb(145 161 190 / 0.2);
  background: rgb(255 255 255 / 0.04);
}

.vtx-admin-list-card {
  @apply flex flex-col justify-between gap-5;
}
</style>
