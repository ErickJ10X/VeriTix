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
    {
      label: 'Eventos',
      value: events.value.length,
      hint: `${scheduledEvents} próximos`,
      icon: 'i-lucide-calendar',
      variant: 'warning' as const,
    },
    {
      label: 'Usuarios',
      value: users.value.length,
      hint: `${activeUsers} activos`,
      icon: 'i-lucide-users',
      variant: 'primary' as const,
    },
    {
      label: 'Artistas',
      value: artists.value.length,
      hint: `${activeArtists} activos`,
      icon: 'i-lucide-mic',
      variant: 'success' as const,
    },
    {
      label: 'Atención',
      value: attentionItems,
      hint: 'requeridos',
      icon: 'i-lucide-alert-circle',
      variant: attentionItems > 0 ? 'error' as const : 'default' as const,
    },
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

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Upcoming Events -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold tracking-tight text-default">
              Próximos eventos
            </h2>
            <UButton to="/admin/events" variant="ghost" size="sm" color="neutral">
              Ver todos
              <UIcon name="i-lucide-arrow-right" class="size-4 ml-1" />
            </UButton>
          </div>

          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="i in 4" :key="i" class="h-20 rounded-2xl" />
          </div>

          <AdminCard v-else-if="upcomingEvents.length === 0" padding="default">
            <div class="flex flex-col items-center justify-center py-8">
              <div class="p-3 rounded-full bg-elevated mb-3">
                <UIcon name="i-lucide-calendar-x" class="size-6 text-muted" />
              </div>
              <p class="text-sm font-medium text-default">
                No hay próximos eventos
              </p>
              <p class="text-xs text-muted mt-1">
                Crea un evento para verlo aquí.
              </p>
            </div>
          </AdminCard>

          <div v-else class="flex flex-col gap-3">
            <NuxtLink
              v-for="event in upcomingEvents"
              :key="event.id"
              :to="`/admin/events/${event.id}/edit`"
              class="group"
            >
              <AdminCard hover>
                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0 flex items-center gap-4">
                    <div class="hidden sm:flex size-12 rounded-xl bg-warning/10 border border-warning/20 items-center justify-center text-warning shrink-0">
                      <UIcon name="i-lucide-calendar" class="size-5" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-medium text-default truncate group-hover:text-warning transition-colors">
                        {{ event.name }}
                      </p>
                      <div class="flex items-center gap-2 mt-1 text-sm text-muted">
                        <UIcon name="i-lucide-map-pin" class="size-3.5" />
                        <span class="truncate">{{ event.venue.name }} · {{ event.venue.city }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right shrink-0 flex flex-col items-end gap-2">
                    <UBadge
                      :color="event.status === 'PUBLISHED' ? 'success' : 'neutral'"
                      variant="subtle"
                      size="sm"
                      class="rounded-full px-2.5 font-medium"
                    >
                      {{ event.status }}
                    </UBadge>
                    <div class="flex items-center gap-1.5 text-xs font-medium text-muted">
                      <UIcon name="i-lucide-clock" class="size-3.5" />
                      {{ new Date(event.eventDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }}
                    </div>
                  </div>
                </div>
              </AdminCard>
            </NuxtLink>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Recent Users -->
          <AdminSection title="Usuarios recientes">
            <template #header-actions>
              <UButton to="/admin/users" variant="ghost" size="xs" color="neutral">
                Ver todos
              </UButton>
            </template>

            <div v-if="pending" class="space-y-3">
              <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
            </div>

            <div v-else-if="recentUsers.length === 0" class="text-sm text-muted py-4 text-center">
              Sin usuarios recientes.
            </div>

            <div v-else class="space-y-1">
              <NuxtLink
                v-for="user in recentUsers.slice(0, 4)"
                :key="user.id"
                :to="`/admin/users/${user.id}/edit`"
                class="group flex items-center gap-3 p-2 rounded-lg hover:bg-elevated transition-colors"
              >
                <div class="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                  {{ user.name.charAt(0) }}{{ user.lastName.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-default truncate group-hover:text-primary transition-colors">
                    {{ user.name }} {{ user.lastName }}
                  </p>
                  <p class="text-xs text-muted truncate">
                    {{ user.email }}
                  </p>
                </div>
                <div class="size-2 rounded-full" :class="user.isActive ? 'bg-success' : 'bg-muted'" />
              </NuxtLink>
            </div>
          </AdminSection>

          <!-- Recent Artists -->
          <AdminSection title="Artistas recientes">
            <template #header-actions>
              <UButton to="/admin/artists" variant="ghost" size="xs" color="neutral">
                Ver todos
              </UButton>
            </template>

            <div v-if="pending" class="space-y-3">
              <USkeleton v-for="i in 3" :key="i" class="h-12 w-full" />
            </div>

            <div v-else-if="recentArtists.length === 0" class="text-sm text-muted py-4 text-center">
              Sin artistas recientes.
            </div>

            <div v-else class="space-y-1">
              <NuxtLink
                v-for="artist in recentArtists.slice(0, 4)"
                :key="artist.id"
                :to="`/admin/artists/${artist.id}/edit`"
                class="group flex items-center gap-3 p-2 rounded-lg hover:bg-elevated transition-colors"
              >
                <div class="size-9 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-xs font-semibold text-success">
                  {{ artist.name.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-default truncate group-hover:text-success transition-colors">
                    {{ artist.name }}
                  </p>
                  <p class="text-xs text-muted truncate">
                    {{ artist.country || 'País pendiente' }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </AdminSection>

          <!-- Quick Actions -->
          <AdminSection title="Acciones rápidas">
            <div class="space-y-2">
              <UButton to="/admin/events/new" color="warning" variant="soft" class="w-full justify-start font-medium">
                <UIcon name="i-lucide-calendar-plus" class="size-4 mr-2" />
                Crear evento
              </UButton>
              <UButton to="/admin/users/new" color="neutral" variant="ghost" class="w-full justify-start font-medium">
                <UIcon name="i-lucide-user-plus" class="size-4 mr-2" />
                Crear usuario
              </UButton>
              <UButton to="/admin/artists/new" color="neutral" variant="ghost" class="w-full justify-start font-medium">
                <UIcon name="i-lucide-mic" class="size-4 mr-2" />
                Crear artista
              </UButton>
            </div>
          </AdminSection>
        </div>
      </div>
    </div>
  </AdminPageShell>
</template>
