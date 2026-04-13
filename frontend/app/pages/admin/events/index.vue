<script setup lang="ts">
import type {
  AdminEventMetrics,
  AdminEventRecord,
  AdminOption,
  AdminRequiresAttentionRecord,
  AdminTopEventRecord,
  AdminUpcomingEventRecord,
  GenreOption,
  PaginatedMeta,
  PaginatedResponse,
} from '~/types'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Operaciones de eventos | VeriTix' })

type QuickWindow = 'all' | 'upcoming' | 'thisMonth' | 'past'
type EventBadgeColor = 'success' | 'warning' | 'error' | 'neutral'

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const catalogEvents = ref<AdminEventRecord[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<AdminOption[]>([])
const myEvents = ref<PaginatedResponse<AdminEventRecord> | null>(null)
const upcomingEvents = ref<AdminUpcomingEventRecord[]>([])
const requiresAttention = ref<AdminRequiresAttentionRecord[]>([])
const topEvents = ref<AdminTopEventRecord[]>([])
const focusMetrics = ref<AdminEventMetrics | null>(null)

const selectedEventId = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const dashboardPending = ref(true)
const catalogPending = ref(true)
const filtersPending = ref(true)
const metricsPending = ref(false)
const publishingEventId = ref('')
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

const draftEvents = computed(() => {
  return myEvents.value?.data.filter(event => event.status === 'DRAFT') ?? []
})

const priorityIssueCount = computed(() => {
  return requiresAttention.value.reduce((total, event) => total + event.issues.length, 0)
})

const statCards = computed(() => {
  return [
    {
      label: 'Eventos en atención',
      value: requiresAttention.value.length,
      hint: `${priorityIssueCount.value} alertas detectadas`,
      icon: 'i-lucide-siren',
      tone: requiresAttention.value.length > 0 ? 'warning' as const : 'success' as const,
    },
    {
      label: 'Próximos publicados',
      value: upcomingEvents.value.length,
      hint: 'Ventana operativa inmediata',
      icon: 'i-lucide-calendar-clock',
      tone: 'success' as const,
    },
    {
      label: 'Borradores propios',
      value: draftEvents.value.length,
      hint: `${myEvents.value?.meta.total ?? 0} eventos en tu pipeline`,
      icon: 'i-lucide-file-pen-line',
      tone: draftEvents.value.length > 0 ? 'primary' as const : 'default' as const,
    },
    {
      label: 'Top revenue',
      value: topEvents.value[0] ? formatCurrency(topEvents.value[0].revenue) : '—',
      hint: topEvents.value[0]?.name ?? 'Sin ranking disponible',
      icon: 'i-lucide-badge-euro',
      tone: topEvents.value[0] ? 'primary' as const : 'default' as const,
    },
  ]
})

const focusSummary = computed(() => {
  if (!focusMetrics.value) {
    return []
  }

  return [
    {
      label: 'Vendidas',
      value: formatInteger(focusMetrics.value.capacity.sold),
      hint: `${formatPercent(focusMetrics.value.capacity.occupancyRate)} de ocupación`,
      icon: 'i-lucide-ticket',
      tone: 'primary' as const,
    },
    {
      label: 'Disponibles',
      value: formatInteger(focusMetrics.value.capacity.available),
      hint: `${formatInteger(focusMetrics.value.capacity.total)} de capacidad total`,
      icon: 'i-lucide-armchair',
      tone: 'success' as const,
    },
    {
      label: 'Revenue',
      value: formatCurrency(focusMetrics.value.revenue.total),
      hint: focusMetrics.value.topTicketType
        ? `${focusMetrics.value.topTicketType.name} lidera con ${formatInteger(focusMetrics.value.topTicketType.sold)}`
        : 'Sin ticket dominante todavía',
      icon: 'i-lucide-wallet',
      tone: 'warning' as const,
    },
    {
      label: 'Órdenes',
      value: formatInteger(focusMetrics.value.orders.total),
      hint: `${formatInteger(focusMetrics.value.orders.completed)} completadas`,
      icon: 'i-lucide-shopping-cart',
      tone: 'default' as const,
    },
  ]
})

const focusTicketTypes = computed(() => {
  return focusMetrics.value?.revenue.byTicketType
    .filter(ticketType => ticketType.sold > 0 || ticketType.revenue > 0)
    .slice(0, 3) ?? []
})

const resultSummary = computed(() => {
  if (meta.value.total === 0) {
    return 'No hay eventos publicados para la combinación actual.'
  }

  const start = (meta.value.page - 1) * meta.value.limit + 1
  const end = Math.min(meta.value.page * meta.value.limit, meta.value.total)

  return `Mostrando ${start}-${end} de ${meta.value.total} eventos publicados.`
})

function toStartOfDayIso(value: string): string | undefined {
  if (!value) {
    return undefined
  }

  return new Date(`${value}T00:00:00`).toISOString()
}

function toEndOfDayIso(value: string): string | undefined {
  if (!value) {
    return undefined
  }

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

function buildCatalogQuery(pageValue = page.value) {
  const quickRange = !filters.dateFrom && !filters.dateTo
    ? getQuickWindowRange()
    : { dateFrom: undefined, dateTo: undefined }

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

function formatPercent(value: number) {
  return new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 }).format(value)
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('es-ES').format(value)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function getEventStatusColor(status: string): EventBadgeColor {
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

function getOccupancyLabel(sold: number, total: number) {
  if (total <= 0) {
    return 'Sin aforo definido'
  }

  return `${formatPercent(sold / total)} · ${formatInteger(sold)} / ${formatInteger(total)}`
}

function getCatalogEventImage(event: AdminEventRecord) {
  return event.imageUrl
}

function collectFocusCandidates() {
  return [
    ...requiresAttention.value.map(event => event.id),
    ...draftEvents.value.map(event => event.id),
    ...upcomingEvents.value.map(event => event.id),
    ...catalogEvents.value.map(event => event.id),
    ...topEvents.value.map(event => event.id),
  ]
}

async function ensureFocusEvent() {
  const candidates = collectFocusCandidates()

  if (candidates.length === 0) {
    selectedEventId.value = ''
    focusMetrics.value = null
    return
  }

  const firstCandidate = candidates[0]

  if (!firstCandidate) {
    selectedEventId.value = ''
    focusMetrics.value = null
    return
  }

  if (!selectedEventId.value || !candidates.includes(selectedEventId.value)) {
    selectedEventId.value = firstCandidate
  }

  await loadFocusMetrics(selectedEventId.value)
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
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los filtros operativos.')
  }
  finally {
    filtersPending.value = false
  }
}

async function loadCatalog(targetPage = page.value) {
  catalogPending.value = true

  try {
    const response = await apiRequest<PaginatedResponse<AdminEventRecord>>('/admin/events', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: buildCatalogQuery(targetPage),
    })

    catalogEvents.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el catálogo publicado.')
  }
  finally {
    catalogPending.value = false
  }
}

async function loadDashboard() {
  dashboardPending.value = true

  try {
    const [myEventsResponse, upcomingResponse, attentionResponse, topEventsResponse] = await Promise.all([
      apiRequest<PaginatedResponse<AdminEventRecord>>('/admin/events/my-events', {
        method: 'GET',
        headers: requireAdminHeaders(),
        query: { page: 1, limit: 6 },
      }),
      apiRequest<AdminUpcomingEventRecord[]>('/admin/events/upcoming', {
        method: 'GET',
        headers: requireAdminHeaders(),
        query: { limit: 5 },
      }),
      apiRequest<AdminRequiresAttentionRecord[]>('/admin/events/requires-attention', {
        method: 'GET',
        headers: requireAdminHeaders(),
      }),
      apiRequest<AdminTopEventRecord[]>('/admin/events/top-events', {
        method: 'GET',
        headers: requireAdminHeaders(),
        query: { limit: 5 },
      }),
    ])

    myEvents.value = myEventsResponse
    upcomingEvents.value = upcomingResponse
    requiresAttention.value = attentionResponse
    topEvents.value = topEventsResponse
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el panel operativo de eventos.')
  }
  finally {
    dashboardPending.value = false
  }
}

async function loadFocusMetrics(eventId: string) {
  if (!eventId) {
    focusMetrics.value = null
    return
  }

  metricsPending.value = true

  try {
    focusMetrics.value = await apiRequest<AdminEventMetrics>(`/admin/events/${eventId}/metrics`, {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar las métricas del evento seleccionado.')
  }
  finally {
    metricsPending.value = false
  }
}

async function refreshDashboard() {
  errorMessage.value = ''
  await Promise.all([loadDashboard(), loadCatalog(page.value)])
  await ensureFocusEvent()
}

async function publishEvent(eventId: string) {
  publishingEventId.value = eventId
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await apiRequest(`/admin/events/${eventId}/publish`, {
      method: 'POST',
      headers: requireAdminHeaders(),
    })

    successMessage.value = 'Evento publicado correctamente.'
    await refreshDashboard()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos publicar el evento.')
  }
  finally {
    publishingEventId.value = ''
  }
}

async function removeEvent(eventId: string) {
  deletingEventId.value = eventId
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await apiRequest(`/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })

    successMessage.value = 'Evento cancelado correctamente.'
    await refreshDashboard()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cancelar el evento.')
  }
  finally {
    deletingEventId.value = ''
  }
}

async function focusEvent(eventId: string) {
  selectedEventId.value = eventId
  await loadFocusMetrics(eventId)
}

function applyCatalogFilters() {
  page.value = 1
  void loadCatalog(1)
}

function resetCatalogFilters() {
  filters.search = ''
  filters.city = ''
  filters.genreId = ''
  filters.formatId = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  quickWindow.value = 'all'
  page.value = 1
  void loadCatalog(1)
}

function goToCatalogPage(nextPage: number) {
  void loadCatalog(nextPage)
}

onMounted(async () => {
  await ensureAdminSession()
  await Promise.all([loadFilterOptions(), loadDashboard(), loadCatalog()])
  await ensureFocusEvent()
})
</script>

<template>
  <AdminPageShell
    title="Operaciones de eventos"
    description=""
    primary-action-to="/admin/events/new"
    primary-action-label="Nuevo evento"
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="admin-events-page">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <AdminOverviewPanel
        eyebrow="Control operativo"
        title="Prioriza lo que importa ahora"
      >
        <template #actions>
          <BaseButton kind="secondary" size="sm" leading-icon="i-lucide-refresh-cw" @click="refreshDashboard">
            Refrescar
          </BaseButton>
        </template>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <template v-if="dashboardPending">
            <div v-for="i in 4" :key="i" class="rounded-2xl border border-default bg-default p-6">
              <USkeleton class="mb-4 h-10 w-10 rounded-lg" />
              <USkeleton class="mb-2 h-8 w-20" />
              <USkeleton class="h-4 w-28" />
            </div>
          </template>

          <AdminStatCard
            v-for="card in statCards"
            v-else
            :key="card.label"
            :label="card.label"
            :value="card.value"
            :hint="card.hint"
            :icon="card.icon"
            :tone="card.tone"
          />
        </div>
      </AdminOverviewPanel>

      <div class="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div class="space-y-8">
          <AdminOverviewPanel
            eyebrow="Atención inmediata"
            title="Eventos que necesitan intervención"
            tone="subtle"
          >
            <div class="space-y-4">
              <template v-if="dashboardPending">
                <USkeleton v-for="i in 3" :key="`attention-${i}`" class="h-28 rounded-2xl" />
              </template>

              <AdminEmptyState
                v-else-if="requiresAttention.length === 0"
                icon="i-lucide-shield-check"
                title="Todo bajo control"
                description="No hay eventos con alertas estructurales ahora mismo."
              />

              <AdminEventRow
                v-for="event in requiresAttention"
                v-else
                :key="event.id"
                :title="event.name"
                :to="`/admin/events/${event.id}/edit`"
                :event-date="event.eventDate"
                :status="event.status"
                :active="selectedEventId === event.id"
              >
                <template #badges>
                  <UBadge :color="getEventStatusColor(event.status)" variant="soft" size="xs" class="rounded-full px-2.5">
                    {{ event.status }}
                  </UBadge>
                  <UBadge color="warning" variant="outline" size="xs" class="rounded-full px-2.5">
                    {{ event.issues.length }} issue{{ event.issues.length !== 1 ? 's' : '' }}
                  </UBadge>
                </template>

                <template #details>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="issue in event.issues"
                      :key="issue"
                      color="warning"
                      variant="subtle"
                      size="xs"
                      class="rounded-full px-2.5"
                    >
                      {{ issue }}
                    </UBadge>
                  </div>
                </template>

                <template #actions>
                  <BaseButton kind="tertiary" size="sm" @click="focusEvent(event.id)">
                    Métricas
                  </BaseButton>
                  <BaseButton kind="secondary" size="sm" :to="`/admin/events/${event.id}/edit`">
                    Resolver
                  </BaseButton>
                </template>
              </AdminEventRow>
            </div>
          </AdminOverviewPanel>

          <div class="grid gap-8 lg:grid-cols-2">
            <AdminOverviewPanel
              eyebrow="Pipeline"
              title="Tus eventos y borradores"
              tone="subtle"
            >
              <div class="space-y-4">
                <template v-if="dashboardPending">
                  <USkeleton v-for="i in 3" :key="`mine-${i}`" class="h-28 rounded-2xl" />
                </template>

                <AdminEmptyState
                  v-else-if="!myEvents || myEvents.data.length === 0"
                  icon="i-lucide-file-stack"
                  title="Sin pipeline propio"
                  description="Todavía no hay eventos en tu carril operativo."
                  action-label="Crear evento"
                  action-to="/admin/events/new"
                />

                <AdminEventRow
                  v-for="event in myEvents?.data || []"
                  v-else
                  :key="event.id"
                  :title="event.name"
                  :to="`/admin/events/${event.id}/edit`"
                  :event-date="event.eventDate"
                  :venue-name="event.venue.name"
                  :venue-city="event.venue.city"
                  :image-url="event.imageUrl"
                  :status="event.status"
                  :active="selectedEventId === event.id"
                  compact
                >
                  <template #badges>
                    <UBadge :color="getEventStatusColor(event.status)" variant="soft" size="xs" class="rounded-full px-2.5">
                      {{ event.status }}
                    </UBadge>
                    <UBadge v-if="event.format" color="neutral" variant="outline" size="xs" class="rounded-full px-2.5">
                      {{ event.format.name }}
                    </UBadge>
                  </template>

                  <template #actions>
                    <BaseButton kind="tertiary" size="sm" @click="focusEvent(event.id)">
                      Métricas
                    </BaseButton>
                    <BaseButton
                      v-if="event.status === 'DRAFT'"
                      kind="primary"
                      size="sm"
                      :loading="publishingEventId === event.id"
                      @click="publishEvent(event.id)"
                    >
                      Publicar
                    </BaseButton>
                    <BaseButton v-else kind="secondary" size="sm" :to="`/admin/events/${event.id}/edit`">
                      Editar
                    </BaseButton>
                  </template>
                </AdminEventRow>
              </div>
            </AdminOverviewPanel>

            <AdminOverviewPanel
              eyebrow="Calendario"
              title="Próximos publicados"
              tone="subtle"
            >
              <div class="space-y-4">
                <template v-if="dashboardPending">
                  <USkeleton v-for="i in 3" :key="`upcoming-${i}`" class="h-28 rounded-2xl" />
                </template>

                <AdminEmptyState
                  v-else-if="upcomingEvents.length === 0"
                  icon="i-lucide-calendar-search"
                  title="Sin próximos publicados"
                  description="No hay eventos publicados en la ventana inmediata."
                />

                <AdminEventRow
                  v-for="event in upcomingEvents"
                  v-else
                  :key="event.id"
                  :title="event.name"
                  :to="`/admin/events/${event.id}/edit`"
                  :event-date="event.eventDate"
                  :venue-name="event.venue.name"
                  :venue-city="event.venue.city"
                  :active="selectedEventId === event.id"
                  compact
                >
                  <template #badges>
                    <UBadge color="success" variant="soft" size="xs" class="rounded-full px-2.5">
                      Publicado
                    </UBadge>
                  </template>

                  <template #details>
                    <p class="text-sm text-toned">
                      {{ getOccupancyLabel(event.ticketsSold, event.totalCapacity) }}
                    </p>
                  </template>

                  <template #actions>
                    <BaseButton kind="tertiary" size="sm" @click="focusEvent(event.id)">
                      Métricas
                    </BaseButton>
                  </template>
                </AdminEventRow>
              </div>
            </AdminOverviewPanel>
          </div>

          <AdminOverviewPanel
            eyebrow="Catálogo publicado"
            title="Opera la vitrina pública"
            tone="subtle"
          >
            <div class="space-y-6">
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
                :loading="catalogPending || filtersPending"
                :quick-window-options="quickWindowOptions"
                class="w-full"
                @apply="applyCatalogFilters"
                @reset="resetCatalogFilters"
              />

              <div class="flex flex-col gap-3 border-y border-default/70 py-3 text-sm text-toned sm:flex-row sm:items-center sm:justify-between">
                <p class="font-medium text-highlighted">
                  {{ resultSummary }}
                </p>
                <UBadge color="neutral" variant="soft" size="sm" class="rounded-full px-2.5">
                  Página {{ meta.page }} de {{ meta.totalPages }}
                </UBadge>
              </div>

              <div class="space-y-4">
                <template v-if="catalogPending">
                  <USkeleton v-for="i in 4" :key="`catalog-${i}`" class="h-32 rounded-2xl" />
                </template>

                <AdminEmptyState
                  v-else-if="catalogEvents.length === 0"
                  icon="i-lucide-search-x"
                  title="Sin resultados publicados"
                  description="Prueba con otra ventana temporal o cambia los filtros del catálogo."
                />

                <AdminEventRow
                  v-for="event in catalogEvents"
                  v-else
                  :key="event.id"
                  :title="event.name"
                  :to="`/admin/events/${event.id}/edit`"
                  :event-date="event.eventDate"
                  :venue-name="event.venue.name"
                  :venue-city="event.venue.city"
                  :image-url="getCatalogEventImage(event)"
                  :status="event.status"
                  :active="selectedEventId === event.id"
                >
                  <template #badges>
                    <UBadge :color="getEventStatusColor(event.status)" variant="soft" size="xs" class="rounded-full px-2.5">
                      {{ event.status }}
                    </UBadge>
                    <UBadge v-if="event.format" color="neutral" variant="outline" size="xs" class="rounded-full px-2.5">
                      {{ event.format.name }}
                    </UBadge>
                  </template>

                  <template #actions>
                    <BaseButton kind="tertiary" size="sm" @click="focusEvent(event.id)">
                      Métricas
                    </BaseButton>
                    <BaseButton kind="secondary" size="sm" :to="`/admin/events/${event.id}/edit`">
                      Editar
                    </BaseButton>
                    <AdminDeleteAction
                      item-label="el evento"
                      :pending="deletingEventId === event.id"
                      @confirm="removeEvent(event.id)"
                    />
                  </template>
                </AdminEventRow>
              </div>

              <div class="flex justify-center pt-2">
                <AdminPaginationBar
                  v-if="meta.totalPages > 1"
                  :page="meta.page"
                  :total-pages="meta.totalPages"
                  :total-items="meta.total"
                  :page-size="meta.limit"
                  :pending="catalogPending"
                  @change="goToCatalogPage"
                />
              </div>
            </div>
          </AdminOverviewPanel>
        </div>

        <div class="space-y-8">
          <AdminOverviewPanel
            eyebrow="Evento en foco"
            :title="focusMetrics?.eventName ?? 'Selecciona un evento'"
            description=""
            tone="subtle"
          >
            <div v-if="metricsPending" class="grid gap-4 sm:grid-cols-2">
              <USkeleton v-for="i in 4" :key="`metrics-${i}`" class="h-28 rounded-2xl" />
            </div>

            <div v-else-if="focusMetrics" class="space-y-6">
              <div class="flex flex-wrap items-center gap-2">
                <UBadge :color="getEventStatusColor(focusMetrics.status)" variant="soft" size="sm" class="rounded-full px-2.5">
                  {{ focusMetrics.status }}
                </UBadge>
                <UBadge color="neutral" variant="outline" size="sm" class="rounded-full px-2.5">
                  {{ formatPercent(focusMetrics.capacity.occupancyRate) }} de ocupación
                </UBadge>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <AdminStatCard
                  v-for="card in focusSummary"
                  :key="card.label"
                  :label="card.label"
                  :value="card.value"
                  :hint="card.hint"
                  :icon="card.icon"
                  :tone="card.tone"
                />
              </div>

              <AdminSection title="Desglose comercial" compact>
                <div class="space-y-3">
                  <div class="grid gap-3 text-sm text-toned sm:grid-cols-2">
                    <div class="rounded-xl border border-default bg-default px-4 py-3">
                      <p class="font-medium text-highlighted">
                        Órdenes pendientes
                      </p>
                      <p class="mt-1 text-2xl font-semibold text-default">
                        {{ formatInteger(focusMetrics.orders.pending) }}
                      </p>
                    </div>
                    <div class="rounded-xl border border-default bg-default px-4 py-3">
                      <p class="font-medium text-highlighted">
                        Órdenes reembolsadas
                      </p>
                      <p class="mt-1 text-2xl font-semibold text-default">
                        {{ formatInteger(focusMetrics.orders.refunded) }}
                      </p>
                    </div>
                  </div>

                  <div v-if="focusTicketTypes.length > 0" class="space-y-2">
                    <div
                      v-for="ticketType in focusTicketTypes"
                      :key="ticketType.name"
                      class="flex items-center justify-between rounded-xl border border-default bg-default px-4 py-3 text-sm"
                    >
                      <div>
                        <p class="font-medium text-highlighted">
                          {{ ticketType.name }}
                        </p>
                        <p class="text-toned">
                          {{ formatInteger(ticketType.sold) }} vendidos
                        </p>
                      </div>
                      <p class="font-semibold text-default">
                        {{ formatCurrency(ticketType.revenue) }}
                      </p>
                    </div>
                  </div>
                </div>
              </AdminSection>
            </div>

            <AdminEmptyState
              v-else
              icon="i-lucide-chart-column"
              title="Sin evento en foco"
              description="Todavía no hay suficiente contexto para cargar métricas."
            />
          </AdminOverviewPanel>

          <AdminOverviewPanel
            eyebrow="Ranking"
            title="Top eventos por tickets vendidos"
            tone="subtle"
          >
            <div class="space-y-4">
              <template v-if="dashboardPending">
                <USkeleton v-for="i in 3" :key="`top-${i}`" class="h-28 rounded-2xl" />
              </template>

              <AdminEmptyState
                v-else-if="topEvents.length === 0"
                icon="i-lucide-trophy"
                title="Sin ranking disponible"
                description="Aún no hay suficiente venta cerrada para construir el top."
              />

              <AdminEventRow
                v-for="event in topEvents"
                v-else
                :key="event.id"
                :title="event.name"
                :to="`/admin/events/${event.id}/edit`"
                :event-date="event.eventDate"
                :venue-name="event.venue.name"
                :venue-city="event.venue.city"
                :active="selectedEventId === event.id"
                compact
              >
                <template #badges>
                  <UBadge color="primary" variant="soft" size="xs" class="rounded-full px-2.5">
                    {{ formatInteger(event.ticketsSold) }} tickets
                  </UBadge>
                </template>

                <template #details>
                  <p class="text-sm text-toned">
                    {{ formatCurrency(event.revenue) }} · {{ getOccupancyLabel(event.ticketsSold, event.totalCapacity) }}
                  </p>
                </template>

                <template #actions>
                  <BaseButton kind="tertiary" size="sm" @click="focusEvent(event.id)">
                    Métricas
                  </BaseButton>
                </template>
              </AdminEventRow>
            </div>
          </AdminOverviewPanel>
        </div>
      </div>
    </div>
  </AdminPageShell>
</template>
