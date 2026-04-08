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
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
] as const

const filteredUsers = computed(() => {
  let result = users.value

  if (search.value.trim()) {
    const term = search.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(term)
      || u.lastName.toLowerCase().includes(term)
      || u.email.toLowerCase().includes(term),
    )
  }

  if (filterStatus.value !== 'all') {
    result = result.filter(u =>
      filterStatus.value === 'active' ? u.isActive : !u.isActive,
    )
  }

  return result
})

const metrics = computed(() => {
  const active = users.value.filter(u => u.isActive).length
  const inactive = users.value.length - active
  const admins = users.value.filter(u => u.role === 'ADMIN').length

  return [
    {
      label: 'Total usuarios',
      value: users.value.length,
      icon: 'i-lucide-users',
      variant: 'primary' as const,
    },
    {
      label: 'Activos',
      value: active,
      icon: 'i-lucide-user-check',
      variant: 'success' as const,
    },
    {
      label: 'Inactivos',
      value: inactive,
      icon: 'i-lucide-user-x',
      variant: inactive > 0 ? 'warning' as const : 'default' as const,
    },
    {
      label: 'Administradores',
      value: admins,
      icon: 'i-lucide-shield',
      variant: 'primary' as const,
    },
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
    await apiRequest(`/admin/users/${userId}`, { method: 'DELETE', headers: requireAdminHeaders() })
    await loadUsers()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el usuario.')
  }
  finally {
    deletingUserId.value = ''
  }
}

function getInitials(user: AdminUserRecord) {
  return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

function getAvatarColor(user: AdminUserRecord) {
  if (user.role === 'ADMIN') {
    return 'bg-primary/10 text-primary border-primary/20'
  }
  if (user.isActive) {
    return 'bg-success/10 text-success border-success/20'
  }
  return 'bg-default text-muted border-default'
}

function setFilterStatus(value: 'all' | 'active' | 'inactive') {
  filterStatus.value = value
}

onMounted(() => {
  void loadUsers()
})
</script>

<template>
  <AdminPageShell
    title="Gestión de usuarios"
    description="Administra cuentas, roles y permisos de acceso al sistema."
    primary-action-to="/admin/users/new"
    primary-action-label="Nuevo usuario"
  >
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Error -->
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        icon="i-lucide-alert-circle"
      />

      <!-- Metrics Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <template v-if="pending">
          <div v-for="i in 4" :key="i" class="p-6 rounded-2xl border border-default bg-default shadow-sm">
            <USkeleton class="size-10 rounded-lg mb-4" />
            <USkeleton class="h-8 w-16 mb-2" />
            <USkeleton class="h-4 w-24" />
          </div>
        </template>
        <template v-else>
          <AdminMetric
            v-for="metric in metrics"
            :key="metric.label"
            :label="metric.label"
            :value="metric.value"
            :icon="metric.icon"
            :variant="metric.variant"
          />
        </template>
      </div>

      <!-- Main Section -->
      <AdminCard padding="none" class="flex flex-col">
        <!-- Filters Bar -->
        <div class="p-4 sm:p-5 border-b border-default bg-elevated flex flex-col sm:flex-row sm:items-center gap-4 justify-between rounded-t-2xl">
          <div class="flex-1 max-w-md">
            <UInput
              v-model="search"
              placeholder="Buscar por nombre o email..."
              icon="i-lucide-search"
              size="md"
              class="w-full"
              :ui="{ icon: { trailing: { pointer: '' } }, wrapper: 'relative w-full' }"
            />
          </div>
          <div class="flex items-center gap-1.5 p-1 rounded-lg bg-elevated border border-default self-start sm:self-auto">
            <UButton
              v-for="option in statusOptions"
              :key="option.value"
              size="xs"
              :color="filterStatus === option.value ? 'primary' : 'neutral'"
              :variant="filterStatus === option.value ? 'soft' : 'ghost'"
              class="rounded-md"
              @click="setFilterStatus(option.value)"
            >
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Results Info -->
        <div class="px-5 py-3 border-b border-default bg-default flex items-center justify-between text-sm text-muted">
          <p class="font-medium">
            <span class="text-default">{{ filteredUsers.length }}</span> usuario{{ filteredUsers.length !== 1 ? 's' : '' }}
          </p>
          <p v-if="search || filterStatus !== 'all'" class="text-warning font-medium flex items-center gap-1.5">
            <UIcon name="i-lucide-filter" class="size-4" />
            Filtros aplicados
          </p>
        </div>

        <!-- List Area -->
        <div class="bg-elevated min-h-100 p-4 sm:p-5 rounded-b-2xl">
          <!-- Loading State -->
          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="i in 5" :key="i" class="h-20 w-full rounded-2xl" />
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredUsers.length === 0" class="flex flex-col items-center justify-center h-full py-16 text-center">
            <div class="p-4 rounded-full bg-elevated mb-4 ring-1 ring-default">
              <UIcon name="i-lucide-users" class="size-8 text-muted" />
            </div>
            <h3 class="text-lg font-semibold text-default mb-1">
              No se encontraron usuarios
            </h3>
            <p class="text-muted text-sm max-w-sm">
              {{ search ? 'Intenta con otros términos de búsqueda o cambia los filtros activos.' : 'Actualmente no hay usuarios registrados en la plataforma.' }}
            </p>
            <UButton v-if="search || filterStatus !== 'all'" color="neutral" variant="soft" class="mt-6 font-medium" @click="search = ''; filterStatus = 'all'">
              Limpiar filtros
            </UButton>
          </div>

          <!-- Users List -->
          <div v-else class="space-y-3">
            <AdminCard
              v-for="user in filteredUsers"
              :key="user.id"
              hover
              padding="compact"
              class="group flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <!-- Avatar -->
              <div
                class="size-11 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
                :class="getAvatarColor(user)"
              >
                {{ getInitials(user) }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-semibold text-default truncate group-hover:text-primary transition-colors">
                    {{ user.name }} {{ user.lastName }}
                  </p>
                  <UBadge v-if="user.role === 'ADMIN'" color="primary" variant="soft" size="xs" class="font-semibold rounded-full px-2">
                    ADMIN
                  </UBadge>
                </div>
                <div class="flex items-center gap-3 text-sm text-muted">
                  <span class="flex items-center gap-1.5 truncate">
                    <UIcon name="i-lucide-mail" class="size-3.5 shrink-0" />
                    <span class="truncate">{{ user.email }}</span>
                  </span>
                </div>
              </div>

              <!-- Status & Actions -->
              <div class="flex items-center justify-between sm:justify-end gap-6 sm:w-64 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-default sm:border-t-0">
                <UBadge
                  :color="user.isActive ? 'success' : 'neutral'"
                  variant="subtle"
                  size="xs"
                  class="rounded-full px-2.5"
                >
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>

                <div class="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <UButton
                    :to="`/admin/users/${user.id}/edit`"
                    color="neutral"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-pencil"
                    class="hover:bg-elevated"
                  />
                  <AdminDeleteAction
                    :item-label="`${user.name} ${user.lastName}`.trim()"
                    :pending="deletingUserId === user.id"
                    @confirm="removeUser(user.id)"
                  />
                </div>
              </div>
            </AdminCard>
          </div>
        </div>
      </AdminCard>
    </div>
  </AdminPageShell>
</template>
