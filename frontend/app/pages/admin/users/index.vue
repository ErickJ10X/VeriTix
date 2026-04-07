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
const search = ref('')

const filteredUsers = computed(() => {
  if (!search.value.trim()) return users.value
  const term = search.value.toLowerCase()
  return users.value.filter(u => 
    u.name.toLowerCase().includes(term) ||
    u.lastName.toLowerCase().includes(term) ||
    u.email.toLowerCase().includes(term)
  )
})

const metrics = computed(() => {
  const active = users.value.filter(u => u.isActive).length
  const inactive = users.value.length - active
  const admins = users.value.filter(u => u.role === 'ADMIN').length
  return [
    { label: 'Total', value: users.value.length },
    { label: 'Activos', value: active },
    { label: 'Inactivos', value: inactive },
    { label: 'Admins', value: admins },
  ]
})

async function loadUsers() {
  pending.value = true
  errorMessage.value = ''
  try {
    await ensureAdminSession()
    const response = await apiRequest<PaginatedResponse<AdminUserRecord>>('/admin/users', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: { page: 1, limit: 100 },
    })
    users.value = response.data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los usuarios.')
  } finally {
    pending.value = false
  }
}

async function removeUser(userId: string) {
  deletingUserId.value = userId
  try {
    await apiRequest(`/admin/users/${userId}`, { method: 'DELETE', headers: requireAdminHeaders() })
    await loadUsers()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el usuario.')
  } finally {
    deletingUserId.value = ''
  }
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <AdminPageShell
    title="Usuarios"
    description="Gestión de cuentas, roles y estado operativo de usuarios."
    primary-action-to="/admin/users/new"
    primary-action-label="Crear usuario"
  >
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Error -->
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        icon="i-lucide-alert-circle"
      />

      <!-- Metrics -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 border-b border-default pb-8">
        <template v-if="pending">
          <USkeleton v-for="i in 4" :key="i" class="h-20" />
        </template>
        <template v-else>
          <div v-for="metric in metrics" :key="metric.label">
            <p class="text-sm text-muted">{{ metric.label }}</p>
            <p class="text-3xl font-semibold mt-1">{{ metric.value }}</p>
          </div>
        </template>
      </div>

      <!-- Search -->
      <div class="flex gap-4">
        <UInput
          v-model="search"
          placeholder="Buscar por nombre o email..."
          icon="i-lucide-search"
          class="max-w-md"
        />
      </div>

      <!-- List -->
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-20" />
      </div>

      <div v-else-if="filteredUsers.length === 0" class="text-center py-12 text-muted">
        <UIcon name="i-lucide-users" class="size-12 mx-auto mb-4 opacity-50" />
        <p>No hay usuarios disponibles.</p>
      </div>

      <div v-else class="divide-y divide-default">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="flex items-center justify-between py-4 hover:bg-elevated -mx-2 px-2 rounded transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="size-10 rounded-full bg-default border border-default flex items-center justify-center text-sm font-medium">
              {{ user.name.charAt(0) }}{{ user.lastName.charAt(0) }}
            </div>
            <div>
              <p class="font-medium">{{ user.name }} {{ user.lastName }}</p>
              <p class="text-sm text-muted">{{ user.email }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right hidden sm:block">
              <UBadge :color="user.isActive ? 'success' : 'neutral'" variant="soft" size="sm">
                {{ user.isActive ? 'Activo' : 'Inactivo' }}
              </UBadge>
              <p class="text-xs text-muted mt-1">{{ user.role }}</p>
            </div>
            <div class="flex items-center gap-2">
              <UButton
                :to="`/admin/users/${user.id}/edit`"
                color="neutral"
                variant="ghost"
                size="sm"
              >
                Editar
              </UButton>
              <AdminDeleteAction
                :item-label="`${user.name} ${user.lastName}`.trim()"
                :pending="deletingUserId === user.id"
                @confirm="removeUser(user.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminPageShell>
</template>
