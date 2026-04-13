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

const attentionQueue = computed(() => {
  const scheduledEvents = events.value.filter(event => new Date(event.eventDate).getTime() >= Date.now()).length
  const draftEvents = events.value.filter(event => event.status === 'DRAFT').length
  const inactiveUsers = users.value.filter(user => !user.isActive).length
  const inactiveArtists = artists.value.filter(artist => !artist.isActive).length

  return [
    {
      label: 'Eventos programados',
      detail: `${scheduledEvents} listos para seguimiento`,
      tone: 'warning' as const,
      icon: 'i-lucide-calendar-clock',
    },
    {
      label: 'Eventos en borrador',
      detail: draftEvents > 0 ? `${draftEvents} pendientes de publicación` : 'No hay borradores bloqueando la agenda',
      tone: draftEvents > 0 ? 'warning' as const : 'default' as const,
      icon: 'i-lucide-file-pen-line',
    },
    {
      label: 'Usuarios inactivos',
      detail: inactiveUsers > 0 ? `${inactiveUsers} requieren revisión` : 'Sin incidencias en cuentas',
      tone: inactiveUsers > 0 ? 'error' as const : 'success' as const,
      icon: 'i-lucide-user-x',
    },
    {
      label: 'Artistas inactivos',
      detail: inactiveArtists > 0 ? `${inactiveArtists} necesitan atención` : 'Catálogo estable hoy',
      tone: inactiveArtists > 0 ? 'error' as const : 'success' as const,
      icon: 'i-lucide-mic-off',
    },
  ]
})

const quickActions = [
  {
    label: 'Crear evento',
    to: '/admin/events/new',
    kind: 'primary' as const,
    icon: 'i-lucide-calendar-plus',
  },
  {
    label: 'Nuevo usuario',
    to: '/admin/users/new',
    kind: 'secondary' as const,
    icon: 'i-lucide-user-plus',
  },
  {
    label: 'Nuevo artista',
    to: '/admin/artists/new',
    kind: 'secondary' as const,
    icon: 'i-lucide-mic-vocal',
  },
] as const

function formatRelativeDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}

function getStatusTone(status: string) {
  if (status === 'PUBLISHED') {
    return 'success'
  }
  if (status === 'DRAFT') {
    return 'warning'
  }
  if (status === 'CANCELLED') {
    return 'error'
  }

  return 'neutral'
}

function getUserInitials(user: AdminUserRecord) {
  return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

function getArtistInitials(artist: AdminArtistRecord) {
  return artist.name.charAt(0).toUpperCase()
}

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
    description="Supervisa agenda, personas y catálogo desde una vista clara, más útil y menos saturada visualmente."
    primary-action-to="/admin/events/new"
    primary-action-label="Nuevo evento"
  >
    <div class="mx-auto max-w-7xl space-y-8">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        icon="i-lucide-alert-circle"
      />

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <template v-if="pending">
          <UiGlassPanel v-for="index in 4" :key="index" tone="subtle" radius="md" padding="md">
            <USkeleton class="mb-4 size-10 rounded-lg" />
            <USkeleton class="mb-2 h-8 w-16" />
            <USkeleton class="h-4 w-24" />
          </UiGlassPanel>
        </template>

        <template v-else>
          <AdminStatCard
            v-for="metric in metrics"
            :key="metric.label"
            :label="metric.label"
            :value="metric.value"
            :hint="metric.hint"
            :icon="metric.icon"
            :tone="metric.variant"
          />
        </template>
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
        <AdminOverviewPanel
          eyebrow="Agenda"
          title="Próximos eventos"
          description="Lo siguiente que entra en operación. Prioriza aquí la revisión diaria y los eventos que van a salir primero."
        >
          <template #actions>
            <BaseButton kind="tertiary" size="sm" to="/admin/events" trailing-icon="i-lucide-arrow-right">
              Ver todos
            </BaseButton>
          </template>

          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="index in 4" :key="index" class="h-24 rounded-xl" />
          </div>

          <AdminEmptyState
            v-else-if="upcomingEvents.length === 0"
            icon="i-lucide-calendar-x"
            title="No hay próximos eventos"
            description="Crea un evento nuevo para empezar a poblar la agenda operativa del dashboard."
            action-label="Crear evento"
            action-to="/admin/events/new"
          />

          <div v-else class="divide-y divide-default/55">
            <NuxtLink
              v-for="event in upcomingEvents"
              :key="event.id"
              :to="`/admin/events/${event.id}/edit`"
              class="group flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex min-w-0 items-start gap-4">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-warning/20 bg-warning/10 text-warning">
                  <UIcon name="i-lucide-calendar-range" class="size-5" />
                </div>

                <div class="min-w-0 space-y-2">
                  <p class="truncate text-base font-semibold text-highlighted transition-colors group-hover:text-warning">
                    {{ event.name }}
                  </p>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-toned">
                    <span class="inline-flex min-w-0 items-center gap-2">
                      <UIcon name="i-lucide-map-pin" class="size-3.5 text-muted" />
                      <span class="truncate">{{ event.venue.name }} · {{ event.venue.city }}</span>
                    </span>

                    <span class="inline-flex items-center gap-2">
                      <UIcon name="i-lucide-clock-3" class="size-3.5 text-muted" />
                      {{ formatDateTime(event.eventDate) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-3 self-start sm:self-center">
                <BaseBadge kind="status" :color="getStatusTone(event.status)" size="sm">
                  {{ event.status }}
                </BaseBadge>

                <UIcon name="i-lucide-chevron-right" class="size-4 text-muted transition-colors group-hover:text-highlighted" />
              </div>
            </NuxtLink>
          </div>
        </AdminOverviewPanel>

        <AdminOverviewPanel
          eyebrow="Operación"
          title="Foco del día"
          description="Un resumen corto de lo que merece atención y de las acciones más probables dentro del flujo admin."
          tone="subtle"
        >
          <div class="space-y-4">
            <div class="space-y-3">
              <div
                v-for="item in attentionQueue"
                :key="item.label"
                class="flex items-start gap-3 rounded-xl border border-default/60 bg-default/25 px-4 py-3"
              >
                <div
                  class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border"
                  :class="[
                    item.tone === 'warning' && 'border-warning/20 bg-warning/10 text-warning',
                    item.tone === 'success' && 'border-success/20 bg-success/10 text-success',
                    item.tone === 'error' && 'border-error/20 bg-error/10 text-error',
                    item.tone === 'default' && 'border-default bg-elevated text-muted',
                  ]"
                >
                  <UIcon :name="item.icon" class="size-4" />
                </div>

                <div class="space-y-1">
                  <p class="text-sm font-semibold text-highlighted">
                    {{ item.label }}
                  </p>
                  <p class="text-sm leading-relaxed text-toned">
                    {{ item.detail }}
                  </p>
                </div>
              </div>
            </div>

            <div class="border-t border-default/55 pt-4">
              <UiMetaLabel tone="accent">
                Acciones rápidas
              </UiMetaLabel>

              <div class="mt-3 space-y-2.5">
                <BaseButton
                  v-for="action in quickActions"
                  :key="action.to"
                  :to="action.to"
                  :kind="action.kind"
                  size="sm"
                  block
                  :leading-icon="action.icon"
                  class="justify-start"
                >
                  {{ action.label }}
                </BaseButton>
              </div>
            </div>
          </div>
        </AdminOverviewPanel>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <AdminOverviewPanel
          eyebrow="Personas"
          title="Usuarios recientes"
          description="Últimos accesos creados o actualizados para revisar actividad y estado general."
          tone="subtle"
        >
          <template #actions>
            <BaseButton kind="tertiary" size="sm" to="/admin/users" trailing-icon="i-lucide-arrow-right">
              Ver todos
            </BaseButton>
          </template>

          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="index in 4" :key="index" class="h-16 rounded-xl" />
          </div>

          <AdminEmptyState
            v-else-if="recentUsers.length === 0"
            icon="i-lucide-users"
            title="Sin usuarios recientes"
            description="Cuando entren nuevas cuentas o cambios recientes aparecerán aquí para seguimiento rápido."
          />

          <div v-else class="divide-y divide-default/55">
            <NuxtLink
              v-for="user in recentUsers.slice(0, 4)"
              :key="user.id"
              :to="`/admin/users/${user.id}/edit`"
              class="group flex items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                {{ getUserInitials(user) }}
              </div>

              <div class="min-w-0 flex-1 space-y-1">
                <p class="truncate text-sm font-semibold text-highlighted transition-colors group-hover:text-primary">
                  {{ user.name }} {{ user.lastName }}
                </p>
                <p class="truncate text-sm text-toned">
                  {{ user.email }}
                </p>
              </div>

              <BaseBadge kind="status" :color="user.isActive ? 'success' : 'neutral'" size="xs">
                {{ user.isActive ? 'Activo' : 'Inactivo' }}
              </BaseBadge>
            </NuxtLink>
          </div>
        </AdminOverviewPanel>

        <AdminOverviewPanel
          eyebrow="Catálogo"
          title="Artistas recientes"
          description="Altas o cambios recientes del catálogo para verificar consistencia y preparación editorial."
          tone="subtle"
        >
          <template #actions>
            <BaseButton kind="tertiary" size="sm" to="/admin/artists" trailing-icon="i-lucide-arrow-right">
              Ver todos
            </BaseButton>
          </template>

          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="index in 4" :key="index" class="h-16 rounded-xl" />
          </div>

          <AdminEmptyState
            v-else-if="recentArtists.length === 0"
            icon="i-lucide-mic-vocal"
            title="Sin artistas recientes"
            description="El catálogo aún no tiene movimientos recientes. Cuando los haya, aparecerán aquí."
          />

          <div v-else class="divide-y divide-default/55">
            <NuxtLink
              v-for="artist in recentArtists.slice(0, 4)"
              :key="artist.id"
              :to="`/admin/artists/${artist.id}/edit`"
              class="group flex items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full border border-success/20 bg-success/10 text-xs font-semibold text-success">
                {{ getArtistInitials(artist) }}
              </div>

              <div class="min-w-0 flex-1 space-y-1">
                <p class="truncate text-sm font-semibold text-highlighted transition-colors group-hover:text-success">
                  {{ artist.name }}
                </p>
                <p class="truncate text-sm text-toned">
                  {{ artist.country || 'País pendiente' }}
                </p>
              </div>

              <span class="text-xs text-dimmed">
                {{ formatRelativeDate(artist.updatedAt) }}
              </span>
            </NuxtLink>
          </div>
        </AdminOverviewPanel>
      </div>
    </div>
  </AdminPageShell>
</template>
