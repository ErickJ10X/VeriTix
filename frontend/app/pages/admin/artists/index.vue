<script setup lang="ts">
import type { AdminArtistRecord, PaginatedResponse } from '~/types'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin artistas | VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const artists = ref<AdminArtistRecord[]>([])
const pending = ref(true)
const errorMessage = ref('')
const deletingArtistId = ref('')
const search = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
] as const

const filteredArtists = computed(() => {
  let result = artists.value

  if (search.value.trim()) {
    const term = search.value.toLowerCase()
    result = result.filter(a =>
      a.name.toLowerCase().includes(term)
      || a.country?.toLowerCase().includes(term)
      || a.genres.some(g => g.name.toLowerCase().includes(term)),
    )
  }

  if (filterStatus.value !== 'all') {
    result = result.filter(a =>
      filterStatus.value === 'active' ? a.isActive : !a.isActive,
    )
  }

  return result
})

const metrics = computed(() => {
  const active = artists.value.filter(a => a.isActive).length
  const inactive = artists.value.length - active
  const withCountry = artists.value.filter(a => a.country).length

  return [
    {
      label: 'Total artistas',
      value: artists.value.length,
      icon: 'i-lucide-mic',
      variant: 'success' as const,
    },
    {
      label: 'Activos',
      value: active,
      icon: 'i-lucide-circle-play',
      variant: 'success' as const,
    },
    {
      label: 'Inactivos',
      value: inactive,
      icon: 'i-lucide-circle-pause',
      variant: inactive > 0 ? 'warning' as const : 'default' as const,
    },
    {
      label: 'Completos',
      value: withCountry,
      hint: 'con país',
      icon: 'i-lucide-check-circle',
      variant: 'primary' as const,
    },
  ]
})

async function loadArtists() {
  pending.value = true
  errorMessage.value = ''
  try {
    await ensureAdminSession()
    const response = await apiRequest<PaginatedResponse<AdminArtistRecord>>('/admin/artists', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: { page: 1, limit: 100 },
    })
    artists.value = response.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los artistas.')
  }
  finally {
    pending.value = false
  }
}

async function removeArtist(artistId: string) {
  deletingArtistId.value = artistId
  try {
    await apiRequest(`/admin/artists/${artistId}`, { method: 'DELETE', headers: requireAdminHeaders() })
    await loadArtists()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el artista.')
  }
  finally {
    deletingArtistId.value = ''
  }
}

function getInitials(name: string) {
  return name.charAt(0).toUpperCase()
}

function setFilterStatus(value: 'all' | 'active' | 'inactive') {
  filterStatus.value = value
}

function clearFilters() {
  search.value = ''
  filterStatus.value = 'all'
}

onMounted(() => {
  void loadArtists()
})
</script>

<template>
  <AdminPageShell
    title="Directorio de artistas"
    description="Gestiona el catálogo de artistas, sus géneros y visibilidad."
    primary-action-to="/admin/artists/new"
    primary-action-label="Nuevo artista"
  >
    <div class="max-w-7xl mx-auto space-y-6">
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
            :hint="metric.hint"
            :icon="metric.icon"
            :variant="metric.variant"
          />
        </template>
      </div>

      <!-- Main Section -->
      <AdminCard padding="none" class="flex flex-col overflow-hidden">
        <!-- Filters Bar -->
        <div class="p-4 sm:p-5 border-b border-default bg-elevated flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <AdminSearchToolbar
            :search="search"
            :status="filterStatus"
            :status-options="statusOptions"
            search-placeholder="Buscar por nombre, país o género..."
            @update:search="search = $event"
            @update:status="setFilterStatus($event as 'all' | 'active' | 'inactive')"
          />
        </div>

        <!-- Results Info -->
        <div class="px-5 py-3 border-b border-default bg-default flex items-center justify-between text-sm text-muted">
          <p class="font-medium">
            <span class="text-default">{{ filteredArtists.length }}</span> artista{{ filteredArtists.length !== 1 ? 's' : '' }}
          </p>
          <p v-if="search || filterStatus !== 'all'" class="text-warning font-medium flex items-center gap-1.5">
            <UIcon name="i-lucide-filter" class="size-4" />
            Filtros aplicados
          </p>
        </div>

        <!-- List Area -->
        <div class="bg-elevated min-h-[400px] p-4 sm:p-6 lg:p-8">
          <!-- Loading State -->
          <div v-if="pending" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="i in 8" :key="i" class="p-6 rounded-2xl border border-default bg-default h-[220px]">
              <div class="flex items-start justify-between mb-4">
                <USkeleton class="size-16 rounded-full" />
              </div>
              <USkeleton class="h-5 w-3/4 mb-2" />
              <USkeleton class="h-4 w-1/2 mb-4" />
              <div class="flex gap-2">
                <USkeleton class="h-6 w-16 rounded-full" />
                <USkeleton class="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredArtists.length === 0" class="flex flex-col items-center justify-center h-full py-24 text-center">
            <div class="p-4 rounded-full bg-elevated mb-4 ring-1 ring-default">
              <UIcon name="i-lucide-mic-off" class="size-8 text-muted" />
            </div>
            <h3 class="text-lg font-semibold text-default mb-1">
              No se encontraron artistas
            </h3>
            <p class="text-muted text-sm max-w-sm">
              {{ search ? 'Intenta con otros términos de búsqueda o cambia los filtros activos.' : 'Actualmente no hay artistas registrados en el catálogo.' }}
            </p>
            <BaseButton v-if="search || filterStatus !== 'all'" kind="secondary" size="sm" class="mt-6" @click="clearFilters">
              Limpiar filtros
            </BaseButton>
          </div>

          <!-- Artists Grid -->
          <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AdminCard
              v-for="artist in filteredArtists"
              :key="artist.id"
              hover
              class="group relative flex flex-col h-full !p-6"
            >
              <div class="flex items-start justify-between mb-5">
                <div class="size-16 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {{ getInitials(artist.name) }}
                </div>
                <div class="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1 rounded-lg">
                  <BaseButton
                    :to="`/admin/artists/${artist.id}/edit`"
                    kind="secondary"
                    size="sm"
                    aria-label="Editar artista"
                    class="px-2.5"
                  >
                    <UIcon name="i-lucide-pencil" class="size-4" />
                  </BaseButton>
                  <AdminDeleteAction
                    :item-label="artist.name"
                    :pending="deletingArtistId === artist.id"
                    @confirm="removeArtist(artist.id)"
                  />
                </div>
              </div>

              <h3 class="font-semibold text-lg text-default mb-1.5 truncate group-hover:text-success transition-colors">
                <NuxtLink :to="`/admin/artists/${artist.id}/edit`" class="focus:outline-none focus:ring-2 focus:ring-success/40 rounded-sm">
                  <span class="absolute inset-0" aria-hidden="true" />
                  {{ artist.name }}
                </NuxtLink>
              </h3>

              <div class="flex items-center gap-2 text-sm font-medium text-muted mb-4">
                <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
                <span class="truncate">{{ artist.country || 'País no especificado' }}</span>
              </div>

              <div class="flex flex-wrap gap-2 mb-6">
                <UBadge
                  v-for="genre in artist.genres.slice(0, 3)"
                  :key="genre.id"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  class="relative z-10 rounded-md px-2.5 py-1 text-xs font-semibold"
                >
                  {{ genre.name }}
                </UBadge>
                <UBadge
                  v-if="artist.genres.length > 3"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  class="relative z-10 rounded-md px-2.5 py-1 text-xs font-semibold"
                >
                  +{{ artist.genres.length - 3 }}
                </UBadge>
              </div>

              <div class="mt-auto flex items-center justify-between pt-4 border-t border-default relative z-10">
                <UBadge
                  :color="artist.isActive ? 'success' : 'neutral'"
                  variant="soft"
                  size="xs"
                  class="text-xs font-semibold tracking-wide uppercase"
                >
                  {{ artist.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
                <span class="text-xs font-medium text-muted truncate max-w-[100px] hover:text-toned transition-colors" :title="artist.slug">
                  {{ artist.slug }}
                </span>
              </div>
            </AdminCard>
          </div>
        </div>
      </AdminCard>
    </div>
  </AdminPageShell>
</template>
