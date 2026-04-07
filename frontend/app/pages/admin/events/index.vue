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
    { label: 'Total', value: `${meta.value.total}` },
    { label: 'Próximos', value: `${visibleUpcoming}` },
    { label: 'Ciudades', value: `${cityCount}` },
    { label: 'Sin formato', value: `${withoutFormat}` },
  ]
})

const highlightedEvents = computed(() => {
  return [...events.value]
    .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime())
    .slice(0, 3)
})

const resultSummary = computed(() => {
  if (meta.value.total === 0) return 'No hay eventos para la combinación actual.'
  const start = (meta.value.page - 1) * meta.value.limit + 1
  const end = Math.min(meta.value.page * meta.value.limit, meta.value.total)
  return `Mostrando ${start}-${end} de ${meta.value.total} eventos.`
})

function toStartOfDayIso(value: string): string | undefined {
  if (!value) return undefined
  return new Date(`${value}T00:00:00`).toISOString()
}

function toEndOfDayIso(value: string): string | undefined {
  if (!value) return undefined
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
  if (status === 'PUBLISHED') return 'success'
  if (status === 'DRAFT') return 'warning'
  if (status === 'CANCELLED') return 'error'
  return 'neutral'
}

function getEventImage(event: AdminEventRecord) {
  if (event.imageUrl) return event.imageUrl
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
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los filtros.')
  } finally {
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
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los eventos.')
  } finally {
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
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el evento.')
  } finally {
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
    title="Eventos admin"
    description="Una sala de control para leer el catálogo, detectar huecos curatoriales y operar el ciclo completo de cada evento sin fricción."
    primary-action-to="/admin/events/new"
    primary-action-label="Nuevo evento"
  >
    <div class="max-w-7xl mx-auto space-y-8" data-testid="admin-events-page">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Eventos</h1>
          <p class="text-muted mt-1">Gestiona el catálogo completo de eventos.</p>
        </div>
        <UButton to="/admin/events/new" color="primary">
          <UIcon name="i-lucide-plus" class="size-4 mr-1" />
          Crear evento
        </UButton>
      </div>

      <!-- Error -->
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        icon="i-lucide-alert-circle"
      />

      <!-- Metrics -->
      <div class="grid grid-cols-4 gap-6 border-b border-default pb-6">
        <div v-for="metric in metrics" :key="metric.label">
          <p class="text-sm text-muted">{{ metric.label }}</p>
          <p class="text-3xl font-semibold mt-1">{{ metric.value }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="border-b border-default pb-6">
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
          @apply="applyFilters"
          @reset="resetFilters"
        />
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Event List -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">{{ resultSummary }}</p>
            <UBadge color="neutral" variant="soft" size="sm">
              Página {{ meta.page }} de {{ meta.totalPages }}
            </UBadge>
          </div>

          <AdminDataList
            :items="events"
            :loading="pending"
            empty-text="No encontramos eventos con esa combinación."
          >
            <template #default="{ item: event }">
              <div class="flex items-start gap-4">
                <img
                  :src="getEventImage(event)"
                  :alt="event.name"
                  class="size-16 rounded object-cover"
                >
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <UBadge :color="getEventStatusColor(event.status)" variant="soft" size="sm">
                      {{ event.status }}
                    </UBadge>
                    <span v-if="event.format" class="text-xs text-muted">
                      {{ event.format.name }}
                    </span>
                  </div>
                  <NuxtLink
                    :to="`/admin/events/${event.id}/edit`"
                    class="font-medium hover:text-primary transition-colors"
                  >
                    {{ event.name }}
                  </NuxtLink>
                  <p class="text-sm text-muted">{{ event.venue.name }} · {{ event.venue.city }}</p>
                  <p class="text-xs text-muted mt-1">{{ formatDate(event.eventDate) }}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <UButton
                    :to="`/admin/events/${event.id}/edit`"
                    color="neutral"
                    variant="ghost"
                    size="xs"
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
              </div>
            </template>
          </AdminDataList>

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

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Highlighted -->
          <div>
            <h3 class="font-medium mb-3">Próximos eventos</h3>
            <div v-if="pending" class="space-y-2">
              <USkeleton v-for="i in 3" :key="i" class="h-12" />
            </div>
            <div v-else-if="highlightedEvents.length === 0" class="text-sm text-muted py-4">
              No hay eventos próximos.
            </div>
            <div v-else class="divide-y divide-default">
              <NuxtLink
                v-for="event in highlightedEvents"
                :key="event.id"
                :to="`/admin/events/${event.id}/edit`"
                class="flex items-center justify-between py-3 hover:bg-elevated -mx-2 px-2 rounded transition-colors"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium truncate">{{ event.name }}</p>
                  <p class="text-xs text-muted">{{ event.venue.city }}</p>
                </div>
                <span class="text-xs text-muted shrink-0">{{ formatDateShort(event.eventDate) }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Filters -->
          <div class="pt-4 border-t border-default">
            <h3 class="font-medium mb-3">Filtros activos</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-muted">Búsqueda:</dt>
                <dd>{{ filters.search.trim() || '—' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted">Ciudad:</dt>
                <dd>{{ filters.city.trim() || 'Todas' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted">Período:</dt>
                <dd>{{ quickWindowOptions.find(o => o.value === quickWindow)?.label }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted">Género:</dt>
                <dd>{{ genres.find(g => g.id === filters.genreId)?.name || 'Todos' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted">Formato:</dt>
                <dd>{{ formats.find(f => f.id === filters.formatId)?.name || 'Todos' }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </AdminPageShell>
</template>
