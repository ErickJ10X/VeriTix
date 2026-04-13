<script setup lang="ts">
import type {
  AdminEventMetrics,
  AdminEventRecord,
  AdminOption,
  AdminRequiresAttentionRecord,
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
const requiresAttention = ref<AdminRequiresAttentionRecord[]>([])
const focusMetrics = ref<AdminEventMetrics | null>(null)

const selectedEventId = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const dashboardPending = ref(true)
const catalogPending = ref(true)
const filtersPending = ref(true)
const metricsPending = ref(false)
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
      label: 'Alertas abiertas',
      value: priorityIssueCount.value,
      hint: requiresAttention.value.length > 0 ? 'Revisiones pendientes' : 'Sin incidencias activas',
      icon: 'i-lucide-alert-triangle',
      tone: priorityIssueCount.value > 0 ? 'warning' as const : 'success' as const,
    },
    {
      label: 'Catálogo publicado',
      value: meta.value.total,
      hint: meta.value.total > 0 ? `${meta.value.totalPages} páginas disponibles` : 'Sin resultados con los filtros actuales',
      icon: 'i-lucide-store',
      tone: meta.value.total > 0 ? 'primary' as const : 'default' as const,
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

function formatEventDate(value: string) {
  return new Date(value).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
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

function getCatalogEventImage(event: AdminEventRecord) {
  return event.imageUrl
}

function collectFocusCandidates() {
  return [
    ...requiresAttention.value.map(event => event.id),
    ...catalogEvents.value.map(event => event.id),
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
    requiresAttention.value = await apiRequest<AdminRequiresAttentionRecord[]>('/admin/events/requires-attention', {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
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

      <div class="space-y-8">
        <AdminOverviewPanel
          title="Atención inmediata"
          tone="subtle"
        >
          <div class="space-y-4">
            <template v-if="dashboardPending">
              <USkeleton v-for="i in 3" :key="`attention-${i}`" class="h-28 rounded-2xl" />
            </template>

            <AdminEmptyState
              v-else-if="requiresAttention.length === 0"
              icon="i-lucide-shield-check"
              title="Todo al día"
              description="No hay eventos con incidencias ahora mismo."
            />

            <div v-else class="divide-y divide-default/55">
              <div
                v-for="event in requiresAttention"
                :key="event.id"
                class="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 lg:flex-row lg:items-start lg:justify-between"
              >
                <div class="min-w-0 space-y-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <NuxtLink
                      :to="`/admin/events/${event.id}/edit`"
                      class="text-base font-semibold text-highlighted transition-colors hover:text-primary"
                    >
                      {{ event.name }}
                    </NuxtLink>
                    <UBadge :color="getEventStatusColor(event.status)" variant="soft" size="xs" class="rounded-full px-2.5">
                      {{ event.status }}
                    </UBadge>
                    <UBadge color="warning" variant="outline" size="xs" class="rounded-full px-2.5">
                      {{ event.issues.length }} alertas
                    </UBadge>
                    <UBadge
                      v-if="selectedEventId === event.id"
                      color="primary"
                      variant="soft"
                      size="xs"
                      class="rounded-full px-2.5"
                    >
                      En foco
                    </UBadge>
                  </div>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-toned">
                    <span class="inline-flex items-center gap-2">
                      <UIcon name="i-lucide-clock-3" class="size-4 text-muted" />
                      {{ formatEventDate(event.eventDate) }}
                    </span>
                  </div>

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
                </div>

                <div class="flex shrink-0 flex-wrap items-center gap-2">
                  <BaseButton kind="tertiary" size="sm" @click="focusEvent(event.id)">
                    Métricas
                  </BaseButton>
                  <BaseButton kind="secondary" size="sm" :to="`/admin/events/${event.id}/edit`">
                    Revisar
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </AdminOverviewPanel>

        <AdminOverviewPanel
          eyebrow="Evento en foco"
          :title="focusMetrics?.eventName ?? 'Selecciona un evento'"
          description=""
          tone="subtle"
        >
          <div v-if="metricsPending" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            description="Selecciona “Métricas” en una fila para ver el detalle."
          />
        </AdminOverviewPanel>

        <AdminOverviewPanel
          eyebrow="Catálogo"
          title="Catálogo publicado"
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
                description="Prueba con otros filtros."
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
    </div>
  </AdminPageShell>
</template>
