<script setup lang="ts">
import type { AdminEventRecord, AdminOption, GenreOption, PaginatedMeta, PaginatedResponse } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Admin eventos | VeriTix' })

type QuickWindow = 'all' | 'upcoming' | 'thisMonth' | 'past'
type EventBadgeColor = 'success' | 'warning' | 'error' | 'neutral'

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const events = ref<AdminEventRecord[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<AdminOption[]>([])
const pending = ref(true)
const filtersPending = ref(true)
const errorMessage = ref('')
const deletingEventId = ref('')
const page = ref(1)
const pageSize = ref(12)
const quickWindow = ref<QuickWindow>('all')

const meta = ref<PaginatedMeta>({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
})

const filters = reactive({
  search: '',
  city: '',
  genreId: '',
  formatId: '',
  dateFrom: '',
  dateTo: '',
})

const quickWindowOptions: Array<{ value: QuickWindow, label: string }> = [
  { value: 'all', label: 'Todo' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'thisMonth', label: 'Este mes' },
  { value: 'past', label: 'Histórico' },
]

const metrics = computed(() => {
  const now = Date.now()
  const visibleUpcoming = events.value.filter(event => new Date(event.eventDate).getTime() >= now).length
  const withoutFormat = events.value.filter(event => !event.format).length
  const cityCount = new Set(events.value.map(event => event.venue.city)).size

  return [
    {
      label: 'Total',
      value: `${meta.value.total}`,
      icon: 'i-lucide-list',
      variant: 'warning' as const,
    },
    {
      label: 'Próximos',
      value: `${visibleUpcoming}`,
      icon: 'i-lucide-calendar-clock',
      variant: 'success' as const,
    },
    {
      label: 'Ciudades',
      value: `${cityCount}`,
      icon: 'i-lucide-map',
      variant: 'primary' as const,
    },
    {
      label: 'Sin formato',
      value: `${withoutFormat}`,
      icon: 'i-lucide-alert-circle',
      variant: withoutFormat > 0 ? 'error' as const : 'default' as const,
    },
  ]
})

const highlightedEvents = computed(() => {
  return [...events.value]
    .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime())
    .slice(0, 4)
})

const resultSummary = computed(() => {
  if (meta.value.total === 0) { return 'No hay eventos para la combinación actual.' }
  const start = (meta.value.page - 1) * meta.value.limit + 1
  const end = Math.min(meta.value.page * meta.value.limit, meta.value.total)
  return `Mostrando ${start}-${end} de ${meta.value.total} eventos.`
})

function toStartOfDayIso(value: string): string | undefined {
  if (!value) { return undefined }
  return new Date(`${value}T00:00:00`).toISOString()
}

function toEndOfDayIso(value: string): string | undefined {
  if (!value) { return undefined }
  return new Date(`${value}T23:59:59`).toISOString()
}

function getQuickWindowRange() {
  const now = new Date()
  if (quickWindow.value === 'upcoming') {
    return { dateFrom: now.toISOString(), dateTo: undefined }
  }
  if (quickWindow.value === 'past') {
    return { dateFrom: undefined, dateTo: now.toISOString() }
  }
  if (quickWindow.value === 'thisMonth') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    return { dateFrom: monthStart.toISOString(), dateTo: monthEnd.toISOString() }
  }
  return { dateFrom: undefined, dateTo: undefined }
}

function buildQuery(pageValue = page.value) {
  const quickRange = !filters.dateFrom && !filters.dateTo ? getQuickWindowRange() : { dateFrom: undefined, dateTo: undefined }
  return {
    page: pageValue,
    limit: pageSize.value,
    search: filters.search.trim() || undefined,
    city: filters.city.trim() || undefined,
    genreId: filters.genreId || undefined,
    formatId: filters.formatId || undefined,
    dateFrom: toStartOfDayIso(filters.dateFrom) ?? quickRange.dateFrom,
    dateTo: toEndOfDayIso(filters.dateTo) ?? quickRange.dateTo,
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDateShort(value: string) {
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function getEventStatusColor(status: string): EventBadgeColor {
  if (status === 'PUBLISHED') { return 'success' }
  if (status === 'DRAFT') { return 'warning' }
  if (status === 'CANCELLED') { return 'error' }
  return 'neutral'
}

function getEventImage(event: AdminEventRecord) {
  if (event.imageUrl) { return event.imageUrl }
  return `https://picsum.photos/seed/admin-event-${event.id}/240/240`
}

async function loadFilterOptions() {
  filtersPending.value = true
  try {
    const [genresResponse, formatsResponse] = await Promise.all([
      apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
      apiRequest<PaginatedResponse<AdminOption>>('/concert-formats', { method: 'GET' }),
    ])
    genres.value = genresResponse
    formats.value = formatsResponse.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los filtros.')
  }
  finally {
    filtersPending.value = false
  }
}

async function loadEvents(targetPage = page.value) {
  pending.value = true
  errorMessage.value = ''
  try {
    await ensureAdminSession()
    const response = await apiRequest<PaginatedResponse<AdminEventRecord>>('/admin/events', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: buildQuery(targetPage),
    })
    events.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los eventos.')
  }
  finally {
    pending.value = false
  }
}

async function removeEvent(eventId: string) {
  deletingEventId.value = eventId
  try {
    await apiRequest(`/admin/events/${eventId}`, { method: 'DELETE', headers: requireAdminHeaders() })
    if (events.value.length === 1 && page.value > 1) {
      await loadEvents(page.value - 1)
      return
    }
    await loadEvents(page.value)
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el evento.')
  }
  finally {
    deletingEventId.value = ''
  }
}

function applyFilters() {
  page.value = 1
  void loadEvents(1)
}

function changeQuickWindow(nextWindow: QuickWindow) {
  quickWindow.value = nextWindow
  page.value = 1
  void loadEvents(1)
}

function resetFilters() {
  filters.search = ''
  filters.city = ''
  filters.genreId = ''
  filters.formatId = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  quickWindow.value = 'all'
  page.value = 1
  void loadEvents(1)
}

function goToPage(nextPage: number) {
  void loadEvents(nextPage)
}

onMounted(() => {
  void Promise.all([loadFilterOptions(), loadEvents()])
})
</script>

<template>
  <AdminPageShell
    title="Catálogo de eventos"
    description="Una sala de control para leer el catálogo, detectar huecos curatoriales y operar el ciclo completo."
    primary-action-to="/admin/events/new"
    primary-action-label="Nuevo evento"
  >
    <div class="max-w-7xl mx-auto space-y-8" data-testid="admin-events-page">
      <!-- Error -->
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        icon="i-lucide-alert-circle"
      />

      <!-- Metrics -->
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

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <!-- Left Column: Filters & Sidebar -->
        <div class="lg:col-span-1 space-y-6 lg:sticky lg:top-[120px]">
          <!-- Active Filters Summary -->
          <AdminSection title="Filtros activos" compact>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between items-center group">
                <dt class="text-muted font-medium">
                  Búsqueda
                </dt>
                <dd class="text-default truncate max-w-[120px] font-semibold" :title="filters.search">
                  {{ filters.search.trim() || '—' }}
                </dd>
              </div>
              <div class="flex justify-between items-center group">
                <dt class="text-muted font-medium">
                  Ciudad
                </dt>
                <dd class="text-default truncate max-w-[120px] font-semibold" :title="filters.city">
                  {{ filters.city.trim() || 'Todas' }}
                </dd>
              </div>
              <div class="flex justify-between items-center group">
                <dt class="text-muted font-medium">
                  Período
                </dt>
                <dd class="text-default font-semibold">
                  {{ quickWindowOptions.find(o => o.value === quickWindow)?.label }}
                </dd>
              </div>
              <div class="flex justify-between items-center group">
                <dt class="text-muted font-medium">
                  Género
                </dt>
                <dd class="text-default truncate max-w-[120px] font-semibold" :title="genres.find(g => g.id === filters.genreId)?.name">
                  {{ genres.find(g => g.id === filters.genreId)?.name || 'Todos' }}
                </dd>
              </div>
              <div class="flex justify-between items-center group">
                <dt class="text-muted font-medium">
                  Formato
                </dt>
                <dd class="text-default truncate max-w-[120px] font-semibold" :title="formats.find(f => f.id === filters.formatId)?.name">
                  {{ formats.find(f => f.id === filters.formatId)?.name || 'Todos' }}
                </dd>
              </div>
            </dl>
          </AdminSection>

          <!-- Highlighted Events -->
          <AdminSection title="Próximos eventos" compact>
            <div v-if="pending" class="space-y-3">
              <USkeleton v-for="i in 3" :key="i" class="h-14 w-full" />
            </div>
            <div v-else-if="highlightedEvents.length === 0" class="text-sm text-muted py-4 text-center">
              No hay eventos próximos.
            </div>
            <div v-else class="space-y-2">
              <NuxtLink
                v-for="event in highlightedEvents"
                :key="event.id"
                :to="`/admin/events/${event.id}/edit`"
                class="group flex flex-col rounded-lg border border-transparent p-3 transition-colors hover:border-default hover:bg-elevated"
              >
                <p class="text-sm font-semibold text-default truncate transition-colors group-hover:text-warning">
                  {{ event.name }}
                </p>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs text-muted">{{ event.venue.city }}</span>
                  <UBadge color="warning" variant="soft" size="xs" class="rounded-full px-2 py-0.5 font-medium">
                    {{ formatDateShort(event.eventDate) }}
                  </UBadge>
                </div>
              </NuxtLink>
            </div>
          </AdminSection>
        </div>

        <!-- Right Column: Content -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Filters & DataList Container -->
          <AdminCard padding="none" class="flex flex-col overflow-hidden">
            <!-- Advanced Filters Bar -->
            <div class="p-4 sm:p-5 border-b border-default bg-elevated">
              <AdminFiltersBar
                v-model:search="filters.search"
                v-model:city="filters.city"
                v-model:genre-id="filters.genreId"
                v-model:format-id="filters.formatId"
                v-model:date-from="filters.dateFrom"
                v-model:date-to="filters.dateTo"
                v-model:page-size="pageSize"
                v-model:quick-window="quickWindow"
                :genres="genres"
                :formats="formats"
                :loading="pending"
                :quick-window-options="quickWindowOptions"
                class="w-full"
                @apply="applyFilters"
                @reset="resetFilters"
              />
            </div>

            <!-- List Results Info -->
            <div class="px-5 py-3 border-b border-default flex items-center justify-between text-sm text-muted bg-default">
              <p class="font-medium text-default">
                {{ resultSummary }}
              </p>
              <UBadge color="neutral" variant="soft" size="sm" class="font-medium rounded-full px-2.5">
                Página {{ meta.page }} de {{ meta.totalPages }}
              </UBadge>
            </div>

            <!-- List Data -->
            <div class="bg-elevated min-h-[400px] p-4 sm:p-5">
              <AdminDataList
                :items="events"
                :loading="pending"
                empty-text="No encontramos eventos con esa combinación de filtros."
                class="space-y-3"
              >
                <template #default="{ item: event }">
                  <AdminCard hover padding="none" class="group flex flex-col sm:flex-row sm:items-center gap-5 p-5 relative">
                    <!-- Image -->
                    <div class="relative h-48 w-full shrink-0 overflow-hidden rounded-lg bg-elevated sm:h-24 sm:w-24">
                      <img
                        :src="getEventImage(event)"
                        :alt="event.name"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      >
                      <div class="absolute inset-0 rounded-lg ring-1 ring-inset ring-default" />
                    </div>

                    <!-- Content -->
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-2 mb-2 relative z-10">
                        <UBadge :color="getEventStatusColor(event.status)" variant="subtle" size="sm" class="font-bold tracking-wider rounded-full px-2">
                          {{ event.status }}
                        </UBadge>
                        <UBadge v-if="event.format" color="neutral" variant="outline" size="xs" class="rounded-md px-2 py-0.5 font-semibold">
                          {{ event.format.name }}
                        </UBadge>
                      </div>

                      <h3 class="mb-1.5 truncate text-lg font-bold text-default transition-colors group-hover:text-warning">
                        <NuxtLink :to="`/admin/events/${event.id}/edit`" class="rounded-sm focus:outline-none focus:ring-2 focus:ring-warning/40 before:absolute before:inset-0 before:z-0">
                          {{ event.name }}
                        </NuxtLink>
                      </h3>

                      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium text-muted">
                        <div class="flex items-center gap-1.5 truncate">
                          <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
                          <span class="truncate">{{ event.venue.name }} · {{ event.venue.city }}</span>
                        </div>
                        <div class="hidden sm:block size-1 rounded-full bg-muted" />
                        <div class="flex items-center gap-1.5">
                          <UIcon name="i-lucide-clock" class="size-4 shrink-0 text-warning" />
                          <span>{{ formatDate(event.eventDate) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-default sm:border-t-0 shrink-0 relative z-10">
                      <UButton
                        :to="`/admin/events/${event.id}/edit`"
                        color="neutral"
                        variant="soft"
                        size="md"
                        icon="i-lucide-pencil"
                        class="hover:bg-elevated px-3"
                      >
                        Editar
                      </UButton>
                      <AdminDeleteAction
                        item-label="el evento"
                        test-id="admin-event-delete-button"
                        :pending="deletingEventId === event.id"
                        @confirm="removeEvent(event.id)"
                      />
                    </div>
                  </AdminCard>
                </template>
              </AdminDataList>
            </div>

            <!-- Pagination -->
            <div class="p-4 sm:p-5 border-t border-default bg-default flex justify-center">
              <AdminPaginationBar
                v-if="meta.totalPages > 1"
                :page="meta.page"
                :total-pages="meta.totalPages"
                :total-items="meta.total"
                :page-size="meta.limit"
                :pending="pending"
                @change="goToPage"
              />
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  </AdminPageShell>
</template>
