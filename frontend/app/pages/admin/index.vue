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
const lastUpdatedAt = ref('')

const metrics = computed(() => {
  const activeUsers = users.value.filter(user => user.isActive).length
  const activeArtists = artists.value.filter(artist => artist.isActive).length
  const attentionItems = (users.value.length - activeUsers) + (artists.value.length - activeArtists)
  const scheduledEvents = events.value.filter(event => new Date(event.eventDate).getTime() >= Date.now()).length

  return [
    {
      label: 'Eventos cargados',
      value: String(events.value.length),
      hint: `${scheduledEvents} con fecha futura dentro del lote cargado.`,
      icon: 'i-lucide-calendar-range',
      accentClass: 'from-auric',
    },
    {
      label: 'Usuarios activos',
      value: String(activeUsers),
      hint: `${users.value.length - activeUsers} cuentas inactivas necesitan revisión.`,
      icon: 'i-lucide-users',
      accentClass: 'from-cyan',
    },
    {
      label: 'Artistas activos',
      value: String(activeArtists),
      hint: `${artists.value.length - activeArtists} perfiles están fuera de circulación.`,
      icon: 'i-lucide-mic-vocal',
      accentClass: 'from-rose',
    },
    {
      label: 'Atención rápida',
      value: String(attentionItems),
      hint: 'Suma de cuentas y artistas inactivos dentro del resumen actual.',
      icon: 'i-lucide-shield-alert',
      accentClass: 'from-verdant',
    },
  ]
})

const upcomingEvents = computed(() => {
  return [...events.value]
    .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime())
    .slice(0, 4)
})

const recentUsers = computed(() => {
  return [...users.value]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 4)
})

const recentArtists = computed(() => {
  return [...artists.value]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4)
})

const operationalNotes = computed(() => {
  const inactiveUsers = users.value.filter(user => !user.isActive).length
  const inactiveArtists = artists.value.filter(artist => !artist.isActive).length
  const eventsWithoutFormat = events.value.filter(event => !event.format).length

  return [
    {
      label: 'Usuarios inactivos',
      value: inactiveUsers,
      tone: inactiveUsers > 0 ? 'text-auric-300' : 'text-dimmed',
      helper: 'Reactivar o depurar accesos bloqueados.',
    },
    {
      label: 'Artistas inactivos',
      value: inactiveArtists,
      tone: inactiveArtists > 0 ? 'text-crimson-200' : 'text-dimmed',
      helper: 'Revisar visibilidad del directorio.',
    },
    {
      label: 'Eventos sin formato',
      value: eventsWithoutFormat,
      tone: eventsWithoutFormat > 0 ? 'text-nebula-300' : 'text-dimmed',
      helper: 'Buen punto de limpieza editorial.',
    },
  ]
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
    lastUpdatedAt.value = new Date().toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el resumen del dashboard admin.')
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
    eyebrow="Control room"
    title="Dashboard admin"
    description="Superficie operativa para leer el pulso del catálogo, detectar fricción y entrar al módulo correcto con contexto real."
  >
    <section class="space-y-6">
      <div class="vtx-admin-hero">
        <div class="space-y-4">
          <div class="space-y-3">
            <p class="text-[0.68rem] font-semibold tracking-[0.3em] text-secondary uppercase">
              Vista general
            </p>
            <h2 class="font-display text-3xl tracking-[0.03em] text-highlighted sm:text-[2.6rem]">
              Menos escaparate, más sala de control.
            </h2>
          </div>

          <p class="max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
            La home admin ya no arranca desde tres enlaces grandes: ahora resume el estado del sistema, enseña focos de atención y te deja entrar a eventos, usuarios y artistas con una lectura rápida de contexto.
          </p>
        </div>

        <div class="vtx-admin-hero__rail">
          <div>
            <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-dimmed uppercase">
              Última actualización
            </p>
            <p class="mt-2 text-sm text-highlighted">
              {{ lastUpdatedAt || 'Cargando resumen...' }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <BasePrimaryButton to="/admin/events/new" class="px-5">
              Nuevo evento
            </BasePrimaryButton>
            <BaseSecondaryButton to="/admin/users/new" class="px-5">
              Nuevo usuario
            </BaseSecondaryButton>
          </div>
        </div>
      </div>

      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <div v-if="pending" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <USkeleton v-for="index in 4" :key="`metric-${index}`" class="h-44 rounded-[1.8rem]" />
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminDashboardMetricCard
          v-for="metric in metrics"
          :key="metric.label"
          :label="metric.label"
          :value="metric.value"
          :hint="metric.hint"
          :icon="metric.icon"
          :accent-class="metric.accentClass"
        />
      </div>

      <div class="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <AdminDashboardPanel
          eyebrow="Pulso del catálogo"
          title="Próximos eventos"
          description="Los primeros movimientos del calendario, listos para editar o revisar desde el dashboard."
          icon="i-lucide-calendar-clock"
          accent-class="from-auric"
          to="/admin/events"
          action-label="Ir a eventos"
        >
          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="index in 4" :key="`event-${index}`" class="h-20 rounded-2xl" />
          </div>

          <div v-else-if="upcomingEvents.length === 0" class="vtx-admin-empty-state">
            Aún no hay próximos eventos dentro del resumen cargado.
          </div>

          <div v-else class="space-y-3">
            <NuxtLink
              v-for="event in upcomingEvents"
              :key="event.id"
              :to="`/admin/events/${event.id}/edit`"
              class="vtx-admin-row-link"
            >
              <div class="space-y-1">
                <p class="text-sm font-semibold text-highlighted">
                  {{ event.name }}
                </p>
                <p class="text-xs text-toned">
                  {{ event.venue.name }} · {{ event.venue.city }}
                </p>
              </div>

              <div class="text-right">
                <p class="text-xs text-dimmed">
                  {{ new Date(event.eventDate).toLocaleString('es-ES') }}
                </p>
                <p class="mt-1 text-xs text-auric-300">
                  {{ event.status }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </AdminDashboardPanel>

        <AdminDashboardPanel
          eyebrow="Focos inmediatos"
          title="Atención rápida"
          description="Pequeños contadores para detectar fricción antes de entrar a cada módulo."
          icon="i-lucide-siren"
          accent-class="from-cyan"
          to="/admin/users"
          action-label="Ir a usuarios"
        >
          <div class="space-y-3">
            <div v-for="note in operationalNotes" :key="note.label" class="vtx-admin-note-card">
              <div>
                <p class="text-xs font-semibold tracking-[0.16em] text-dimmed uppercase">
                  {{ note.label }}
                </p>
                <p class="mt-2 text-sm text-toned">
                  {{ note.helper }}
                </p>
              </div>

              <p class="font-display text-3xl" :class="note.tone">
                {{ note.value }}
              </p>
            </div>
          </div>
        </AdminDashboardPanel>
      </div>

      <div class="grid gap-5 xl:grid-cols-3">
        <AdminDashboardPanel
          eyebrow="Módulo eventos"
          title="Calendario vivo"
          description="Acceso al lote reciente y al punto de edición directa de cada evento."
          icon="i-lucide-calendar-range"
          accent-class="from-auric"
          to="/admin/events"
          action-label="Abrir eventos"
        >
          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="index in 3" :key="`mini-event-${index}`" class="h-16 rounded-2xl" />
          </div>
          <div v-else-if="events.length === 0" class="vtx-admin-empty-state">
            Sin eventos cargados en este resumen.
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="event in events.slice(0, 3)"
              :key="event.id"
              :to="`/admin/events/${event.id}/edit`"
              class="vtx-admin-mini-row"
            >
              <span class="truncate text-sm font-semibold text-highlighted">{{ event.name }}</span>
              <span class="text-xs text-dimmed">{{ event.currency }}</span>
            </NuxtLink>
          </div>
        </AdminDashboardPanel>

        <AdminDashboardPanel
          eyebrow="Módulo usuarios"
          title="Accesos recientes"
          description="Últimas cuentas dentro del lote admin, con foco en estado y rol operativo."
          icon="i-lucide-users"
          accent-class="from-cyan"
          to="/admin/users"
          action-label="Abrir usuarios"
        >
          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="index in 3" :key="`mini-user-${index}`" class="h-16 rounded-2xl" />
          </div>
          <div v-else-if="recentUsers.length === 0" class="vtx-admin-empty-state">
            Sin usuarios recientes en el resumen.
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="entry in recentUsers"
              :key="entry.id"
              :to="`/admin/users/${entry.id}/edit`"
              class="vtx-admin-mini-row"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">
                  {{ entry.name }} {{ entry.lastName }}
                </p>
                <p class="truncate text-xs text-dimmed">
                  {{ entry.email }}
                </p>
              </div>
              <span class="text-xs" :class="entry.isActive ? 'text-success' : 'text-error'">
                {{ entry.role }}
              </span>
            </NuxtLink>
          </div>
        </AdminDashboardPanel>

        <AdminDashboardPanel
          eyebrow="Módulo artistas"
          title="Directorio activo"
          description="Perfiles actualizados recientemente para entrar rápido al mantenimiento editorial."
          icon="i-lucide-mic-vocal"
          accent-class="from-rose"
          to="/admin/artists"
          action-label="Abrir artistas"
        >
          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="index in 3" :key="`mini-artist-${index}`" class="h-16 rounded-2xl" />
          </div>
          <div v-else-if="recentArtists.length === 0" class="vtx-admin-empty-state">
            Sin artistas recientes en el resumen.
          </div>
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="artist in recentArtists"
              :key="artist.id"
              :to="`/admin/artists/${artist.id}/edit`"
              class="vtx-admin-mini-row"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-highlighted">
                  {{ artist.name }}
                </p>
                <p class="truncate text-xs text-dimmed">
                  {{ artist.country || 'País pendiente' }}
                </p>
              </div>
              <span class="text-xs" :class="artist.isActive ? 'text-success' : 'text-error'">
                {{ artist.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </NuxtLink>
          </div>
        </AdminDashboardPanel>
      </div>
    </section>
  </AdminPageShell>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-hero {
  @apply flex flex-col gap-5 rounded-[2rem] border px-5 py-5 sm:px-6 sm:py-6 xl:flex-row xl:items-end xl:justify-between;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--ui-bg) 78%, black),
      color-mix(in srgb, var(--ui-bg-elevated) 72%, black)
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.04),
    0 24px 42px -34px rgb(5 10 20 / 0.88);
}

.vtx-admin-hero__rail {
  @apply flex min-w-full flex-col gap-4 rounded-[1.6rem] border p-4 sm:p-5 xl:min-w-[19rem] xl:max-w-sm;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg) 70%, transparent);
}

.vtx-admin-row-link,
.vtx-admin-mini-row,
.vtx-admin-note-card,
.vtx-admin-empty-state {
  @apply rounded-[1.4rem] border;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg-accented) 24%, transparent);
}

.vtx-admin-row-link {
  @apply flex items-center justify-between gap-4 p-4 no-underline transition-all duration-150;
}

.vtx-admin-row-link:hover,
.vtx-admin-mini-row:hover {
  border-color: color-mix(in srgb, var(--color-auric-400) 24%, transparent);
  transform: translateY(-1px);
}

.vtx-admin-note-card {
  @apply flex items-center justify-between gap-4 p-4;
}

.vtx-admin-mini-row {
  @apply flex items-center justify-between gap-4 p-4 no-underline transition-all duration-150;
}

.vtx-admin-empty-state {
  @apply px-4 py-5 text-sm;
  color: var(--ui-text-toned);
}
</style>
