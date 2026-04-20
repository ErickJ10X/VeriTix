<script setup lang="ts">
import type {
  AdminOption,
  AdminUserRecord,
  PaginatedMeta,
  PaginatedResponse,
} from '~/types'
import { PAGE_SIZE_OPTIONS } from '~/utils/admin/eventsCatalog'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Usuarios | Admin VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders, roleOptions } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const users = ref<AdminUserRecord[]>([])
const pending = ref(true)
const deletingId = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS

const meta = ref<PaginatedMeta>({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
})

const statusOptions: AdminOption[] = [
  { id: 'true', name: 'Activo' },
  { id: 'false', name: 'Inactivo' },
]

const filters = reactive({
  search: '',
  role: '',
  isActive: '',
})

const roleFilterOptions = computed(() => {
  return roleOptions.map(option => ({
    id: option.value,
    name: option.label,
  }))
})

function roleBadgeColor(role: string) {
  if (role === 'ADMIN') {
    return 'error'
  }
  if (role === 'CREATOR') {
    return 'primary'
  }
  if (role === 'VALIDATOR') {
    return 'warning'
  }

  return 'neutral'
}

async function loadUsers(targetPage = page.value) {
  pending.value = true
  errorMessage.value = ''

  try {
    const response = await apiRequest<PaginatedResponse<AdminUserRecord>>('/admin/users', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: {
        page: targetPage,
        limit: pageSize.value,
        search: filters.search.trim() || undefined,
        role: filters.role || undefined,
        isActive: filters.isActive || undefined,
      },
    })

    users.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los usuarios.')
  }
  finally {
    pending.value = false
  }
}

function applyFilters() {
  page.value = 1
  void loadUsers(1)
}

function resetFilters() {
  filters.search = ''
  filters.role = ''
  filters.isActive = ''
  page.value = 1
  void loadUsers(1)
}

function goToPage(nextPage: number) {
  void loadUsers(nextPage)
}

async function removeUser(userId: string) {
  deletingId.value = userId
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })

    successMessage.value = 'Usuario eliminado correctamente.'
    await loadUsers(page.value)
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el usuario.')
  }
  finally {
    deletingId.value = ''
  }
}

onMounted(async () => {
  await ensureAdminSession()
  await loadUsers()
})
</script>

<template>
  <AdminPageShell
    title="Usuarios"
    description="Gestiona cuentas, roles y estado de acceso del equipo y compradores."
    primary-action-to="/admin/users/new"
    primary-action-label="Nuevo usuario"
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="admin-users-page">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <AdminOverviewPanel
        eyebrow="Administración"
        title="Directorio de usuarios"
        description="Busca por nombre o correo, filtra por rol y controla quién mantiene acceso activo."
        tone="subtle"
      >
        <template #actions>
          <div class="flex items-center gap-3 sm:self-center">
            <BaseButton kind="tertiary" size="md" :disabled="pending" @click="resetFilters">
              Resetear
            </BaseButton>
            <BaseButton kind="primary" size="md" :loading="pending" @click="applyFilters">
              Aplicar
            </BaseButton>
          </div>
        </template>

        <div class="space-y-6">
          <AdminFiltersBar
            v-model:search="filters.search"
            v-model:page-size="pageSize"
            v-model:genre-id="filters.role"
            v-model:format-id="filters.isActive"
            :page-size-options="pageSizeOptions"
            :genres="roleFilterOptions"
            :formats="statusOptions"
            :visible-filters="['pageSize', 'genre', 'format']"
            search-label="Buscar usuario"
            search-placeholder="Nombre o correo"
            genre-label="Rol"
            genre-name="role"
            format-label="Estado"
            format-name="isActive"
            :loading="pending"
            class="w-full"
          />

          <AdminPaginationBar
            :page="meta.page"
            :total-pages="meta.totalPages"
            :total-items="meta.total"
            :page-size="meta.limit"
            :pending="pending"
            @change="goToPage"
          />

          <div class="space-y-4">
            <template v-if="pending">
              <USkeleton v-for="index in 4" :key="index" class="h-28 rounded-2xl" />
            </template>

            <AdminEmptyState
              v-else-if="users.length === 0"
              icon="i-lucide-users"
              title="Sin usuarios"
              description="No encontramos usuarios para estos filtros."
              action-label="Crear usuario"
              action-to="/admin/users/new"
            />

            <AdminCard
              v-for="user in users"
              v-else
              :key="user.id"
              class="border-default/70 bg-elevated/20"
            >
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="space-y-2">
                  <p class="text-base font-semibold text-highlighted">
                    {{ user.name }} {{ user.lastName }}
                  </p>
                  <p class="text-sm text-toned">
                    {{ user.email }} · {{ user.phone }}
                  </p>
                  <div class="flex flex-wrap items-center gap-2">
                    <BaseBadge kind="role" :color="roleBadgeColor(user.role)">
                      {{ user.role }}
                    </BaseBadge>
                    <BaseBadge kind="status" :color="user.isActive ? 'success' : 'neutral'">
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </BaseBadge>
                    <BaseBadge kind="outline" :color="user.emailVerified ? 'success' : 'warning'">
                      {{ user.emailVerified ? 'Verificado' : 'Pendiente' }}
                    </BaseBadge>
                  </div>
                </div>

                <div class="flex items-center gap-2 self-start md:self-center">
                  <BaseButton kind="secondary" size="sm" :to="`/admin/users/${user.id}/edit`">
                    Editar
                  </BaseButton>
                  <AdminDeleteAction
                    item-label="el usuario"
                    trigger-kind="secondary"
                    trigger-class="border-error/35 text-error hover:border-error/50 hover:bg-error/12 hover:text-error"
                    :pending="deletingId === user.id"
                    @confirm="removeUser(user.id)"
                  />
                </div>
              </div>
            </AdminCard>
          </div>

          <AdminPaginationBar
            :page="meta.page"
            :total-pages="meta.totalPages"
            :total-items="meta.total"
            :page-size="meta.limit"
            :pending="pending"
            @change="goToPage"
          />
        </div>
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
