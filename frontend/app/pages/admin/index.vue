<script setup lang="ts">
import type {
  AdminArtistRecord,
  AdminEventRecord,
  AdminUserRecord,
  PaginatedResponse,
} from '~/types'

definePageMeta({
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin | VeriTix',
  description: 'Dashboard operativo para eventos, usuarios y artistas en VeriTix.',
})

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const events = ref<AdminEventRecord[]>([])
const users = ref<AdminUserRecord[]>([])
const artists = ref<AdminArtistRecord[]>([])
const pending = ref(true)
const errorMessage = ref('')

const metrics = computed(() => {
  const activeUsers = users.value.filter(user => user.isActive).length
  const activeArtists = artists.value.filter(artist => artist.isActive).length
  const attentionItems = (users.value.length - activeUsers) + (artists.value.length - activeArtists)
  const scheduledEvents = events.value.filter(event => new Date(event.eventDate).getTime() >= Date.now()).length

  return [
    { label: 'Eventos', value: events.value.length, sub: `${scheduledEvents} próximos` },
    { label: 'Usuarios', value: users.value.length, sub: `${activeUsers} activos` },
    { label: 'Artistas', value: artists.value.length, sub: `${activeArtists} activos` },
    { label: 'Atención', value: attentionItems, sub: 'requeridos' },
  ]
})

const upcomingEvents = computed(() => {
  return [...events.value]
    .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime())
    .slice(0, 5)
})

const recentUsers = computed(() => {
  return [...users.value]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
})

const recentArtists = computed(() => {
  return [...artists.value]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 5)
})

async function loadDashboard() {
  pending.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    const headers = requireAdminHeaders()

    const [eventsResponse, usersResponse, artistsResponse] = await Promise.all([
      apiRequest<PaginatedResponse<AdminEventRecord>>('/admin/events', {
        method: 'GET',
        headers,
        query: { page: 1, limit: 12 },
      }),
      apiRequest<PaginatedResponse<AdminUserRecord>>('/admin/users', {
        method: 'GET',
        headers,
        query: { page: 1, limit: 12 },
      }),
      apiRequest<PaginatedResponse<AdminArtistRecord>>('/admin/artists', {
        method: 'GET',
        headers,
        query: { page: 1, limit: 12 },
      }),
    ])

    events.value = eventsResponse.data
    users.value = usersResponse.data
    artists.value = artistsResponse.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el resumen del dashboard.')
  }
  finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <AdminPageShell
    title="Dashboard"
    description="Resumen operativo del sistema. Accede rápidamente a eventos, usuarios y artistas."
    primary-action-to="/admin/events/new"
    primary-action-label="Nuevo evento"
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
            <p class="text-xs text-muted mt-1">{{ metric.sub }}</p>
          </div>
        </template>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Upcoming Events -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Próximos eventos</h2>
            <UButton to="/admin/events" variant="ghost" size="sm" color="neutral">
              Ver todos
              <UIcon name="i-lucide-arrow-right" class="size-4 ml-1" />
            </UButton>
          </div>

          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="i in 4" :key="i" class="h-16" />
          </div>

          <div v-else-if="upcomingEvents.length === 0" class="text-sm text-muted py-8 text-center">
            No hay próximos eventos cargados.
          </div>

          <div v-else class="divide-y divide-default">
            <NuxtLink
              v-for="event in upcomingEvents"
              :key="event.id"
              :to="`/admin/events/${event.id}/edit`"
              class="flex items-center justify-between py-4 hover:bg-elevated -mx-2 px-2 rounded transition-colors"
            >
              <div class="min-w-0">
                <p class="font-medium truncate">{{ event.name }}</p>
                <p class="text-sm text-muted">{{ event.venue.name }} · {{ event.venue.city }}</p>
              </div>
              <div class="text-right shrink-0">
                <UBadge :color="event.status === 'PUBLISHED' ? 'success' : 'neutral'" variant="soft" size="sm">
                  {{ event.status }}
                </UBadge>
                <p class="text-xs text-muted mt-1">
                  {{ new Date(event.eventDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Recent Users -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">Usuarios recientes</h3>
              <UButton to="/admin/users" variant="ghost" size="xs" color="neutral">
                Ver todos
              </UButton>
            </div>

            <div v-if="pending" class="space-y-2">
              <USkeleton v-for="i in 3" :key="i" class="h-12" />
            </div>

            <div v-else-if="recentUsers.length === 0" class="text-sm text-muted py-4">
              Sin usuarios recientes.
            </div>

            <div v-else class="space-y-2">
              <NuxtLink
                v-for="user in recentUsers.slice(0, 4)"
                :key="user.id"
                :to="`/admin/users/${user.id}/edit`"
                class="flex items-center gap-3 p-2 -mx-2 rounded hover:bg-elevated transition-colors"
              >
                <div class="size-8 rounded-full bg-default border border-default flex items-center justify-center text-xs font-medium">
                  {{ user.name.charAt(0) }}{{ user.lastName.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate">{{ user.name }} {{ user.lastName }}</p>
                  <p class="text-xs text-muted truncate">{{ user.email }}</p>
                </div>
                <UBadge :color="user.isActive ? 'success' : 'neutral'" variant="soft" size="xs">
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </NuxtLink>
            </div>
          </div>

          <!-- Recent Artists -->
          <div class="pt-6 border-t border-default">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">Artistas recientes</h3>
              <UButton to="/admin/artists" variant="ghost" size="xs" color="neutral">
                Ver todos
              </UButton>
            </div>

            <div v-if="pending" class="space-y-2">
              <USkeleton v-for="i in 3" :key="i" class="h-12" />
            </div>

            <div v-else-if="recentArtists.length === 0" class="text-sm text-muted py-4">
              Sin artistas recientes.
            </div>

            <div v-else class="space-y-2">
              <NuxtLink
                v-for="artist in recentArtists.slice(0, 4)"
                :key="artist.id"
                :to="`/admin/artists/${artist.id}/edit`"
                class="flex items-center gap-3 p-2 -mx-2 rounded hover:bg-elevated transition-colors"
              >
                <div class="size-8 rounded-full bg-default border border-default flex items-center justify-center text-xs font-medium">
                  {{ artist.name.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate">{{ artist.name }}</p>
                  <p class="text-xs text-muted">{{ artist.country || 'País pendiente' }}</p>
                </div>
                <UBadge :color="artist.isActive ? 'success' : 'neutral'" variant="soft" size="xs">
                  {{ artist.isActive ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </NuxtLink>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="pt-6 border-t border-default">
            <h3 class="font-medium mb-4">Acciones rápidas</h3>
            <div class="space-y-2">
              <UButton to="/admin/events/new" color="primary" variant="soft" class="w-full justify-start">
                <UIcon name="i-lucide-calendar-plus" class="size-4 mr-2" />
                Crear evento
              </UButton>
              <UButton to="/admin/users/new" color="neutral" variant="ghost" class="w-full justify-start">
                <UIcon name="i-lucide-user-plus" class="size-4 mr-2" />
                Crear usuario
              </UButton>
              <UButton to="/admin/artists/new" color="neutral" variant="ghost" class="w-full justify-start">
                <UIcon name="i-lucide-mic" class="size-4 mr-2" />
                Crear artista
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminPageShell>
</template>
