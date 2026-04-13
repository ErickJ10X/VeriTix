<script setup lang="ts">
import type {
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
type CatalogMode = 'published' | 'review'

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const catalogEvents = ref<AdminEventRecord[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<AdminOption[]>([])
const requiresAttention = ref<AdminRequiresAttentionRecord[]>([])

const errorMessage = ref('')
const successMessage = ref('')
const dashboardPending = ref(true)
const catalogPending = ref(true)
const filtersPending = ref(true)
const deletingEventId = ref('')
const catalogMode = ref<CatalogMode>('published')

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

const controlStats = computed(() => {
  return [
    {
      label: 'En atención',
      value: requiresAttention.value.length,
      hint: requiresAttention.value.length > 0 ? 'Pendientes de revisar' : 'Sin bloqueos activos',
      icon: 'i-lucide-siren',
      tone: requiresAttention.value.length > 0 ? 'warning' as const : 'success' as const,
    },
    {
      label: 'Alertas',
      value: priorityIssueCount.value,
      hint: requiresAttention.value.length > 0 ? 'Distribuidas en revisión' : 'Nada pendiente hoy',
      icon: 'i-lucide-alert-triangle',
      tone: priorityIssueCount.value > 0 ? 'warning' as const : 'success' as const,
    },
    {
      label: 'Publicados',
      value: meta.value.total,
      hint: meta.value.total > 0 ? `${meta.value.totalPages} páginas en catálogo` : 'Sin resultados con los filtros actuales',
      icon: 'i-lucide-store',
      tone: meta.value.total > 0 ? 'primary' as const : 'default' as const,
    },
  ]
})

const catalogModeItems = computed(() => {
  return [
    { value: 'published', label: 'Publicados', icon: 'i-lucide-store' },
    { value: 'review', label: 'Revisión', icon: 'i-lucide-siren' },
  ] satisfies Array<{ value: CatalogMode, label: string, icon: string }>
})

const catalogSectionTitle = computed(() => {
  return catalogMode.value === 'review' ? 'Revisión' : 'Catálogo publicado'
})

const catalogSummary = computed(() => {
  if (catalogMode.value === 'review') {
    if (requiresAttention.value.length === 0) {
      return 'No hay eventos pendientes de revisión.'
    }

    return `${requiresAttention.value.length} eventos requieren revisión.`
  }

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

async function refreshDashboard() {
  errorMessage.value = ''
  await Promise.all([loadDashboard(), loadCatalog(page.value)])
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

function setCatalogMode(value: string) {
  if (value === 'published' || value === 'review') {
    catalogMode.value = value
  }
}

onMounted(async () => {
  await ensureAdminSession()
  await Promise.all([loadFilterOptions(), loadDashboard(), loadCatalog()])
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
        eyebrow="Dashboard"
        title="Control operativo"
        tone="subtle"
      >
        <template #actions>
          <BaseButton kind="secondary" size="sm" leading-icon="i-lucide-refresh-cw" @click="refreshDashboard">
            Refrescar
          </BaseButton>
        </template>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <template v-if="dashboardPending || catalogPending">
            <div v-for="i in 3" :key="i" class="rounded-2xl border border-default bg-default p-6">
              <USkeleton class="mb-4 h-10 w-10 rounded-lg" />
              <USkeleton class="mb-2 h-8 w-20" />
              <USkeleton class="h-4 w-28" />
            </div>
          </template>

          <AdminStatCard
            v-for="card in controlStats"
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

      <AdminOverviewPanel
        eyebrow="Catálogo"
        :title="catalogSectionTitle"
        tone="subtle"
      >
        <template #actions>
          <AdminSegmentedControl
            :items="catalogModeItems"
            :active-value="catalogMode"
            size="sm"
            @select="setCatalogMode"
          />
        </template>

        <div class="space-y-6">
          <AdminFiltersBar
            v-if="catalogMode === 'published'"
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
              {{ catalogSummary }}
            </p>
            <UBadge color="neutral" variant="soft" size="sm" class="rounded-full px-2.5">
              <template v-if="catalogMode === 'review'">
                {{ priorityIssueCount }} alertas
              </template>
              <template v-else>
                Página {{ meta.page }} de {{ meta.totalPages }}
              </template>
            </UBadge>
          </div>

          <div class="space-y-4">
            <template v-if="catalogMode === 'published' && catalogPending">
              <USkeleton v-for="i in 4" :key="`catalog-${i}`" class="h-32 rounded-2xl" />
            </template>

            <AdminEmptyState
              v-else-if="catalogMode === 'review' && requiresAttention.length === 0"
              icon="i-lucide-shield-check"
              title="Sin eventos por revisar"
              description="No hay incidencias activas ahora mismo."
            />

            <AdminEmptyState
              v-else-if="catalogMode === 'published' && catalogEvents.length === 0"
              icon="i-lucide-search-x"
              title="Sin resultados publicados"
              description="Prueba con otros filtros."
            />

            <AdminEventRow
              v-for="event in requiresAttention"
              v-else-if="catalogMode === 'review'"
              :key="event.id"
              :title="event.name"
              :to="`/admin/events/${event.id}/edit`"
              :event-date="event.eventDate"
              :status="event.status"
            >
              <template #badges>
                <UBadge :color="getEventStatusColor(event.status)" variant="soft" size="xs" class="rounded-full px-2.5">
                  {{ event.status }}
                </UBadge>
                <UBadge color="warning" variant="outline" size="xs" class="rounded-full px-2.5">
                  {{ event.issues.length }} alertas
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
                <BaseButton kind="secondary" size="sm" :to="`/admin/events/${event.id}/edit`">
                  Revisar
                </BaseButton>
              </template>
            </AdminEventRow>

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
              v-if="catalogMode === 'published' && meta.totalPages > 1"
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
  </AdminPageShell>
</template>
