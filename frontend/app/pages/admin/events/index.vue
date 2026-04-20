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
interface CatalogEventListItem {
  id: string
  title: string
  to: string
  eventDate: string | null
  status: string
  imageUrl: string | null
  venueName: string
  venueCity: string
  formatName: string
  issues: string[]
  isReview: boolean
}

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
const pageSizeOptions = [
  { label: '12', value: 12 },
  { label: '24', value: 24 },
  { label: '48', value: 48 },
  { label: '96', value: 96 },
]
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

const quickWindowItems = computed(() => {
  return quickWindowOptions.map(option => ({
    value: option.value,
    label: option.label,
  }))
})

function setQuickWindow(value: string) {
  if (value === 'all' || value === 'upcoming' || value === 'thisMonth' || value === 'past') {
    quickWindow.value = value
  }
}

const priorityIssueCount = computed(() => {
  return requiresAttention.value.reduce((total, event) => total + event.issues.length, 0)
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

const catalogListItems = computed<CatalogEventListItem[]>(() => {
  if (catalogMode.value === 'review') {
    const publishedById = new Map(catalogEvents.value.map(event => [event.id, event]))

    return requiresAttention.value.map((event) => {
      const publishedMatch = publishedById.get(event.id)

      return {
        id: event.id,
        title: event.name,
        to: `/admin/events/${event.id}/edit`,
        eventDate: event.eventDate,
        status: event.status,
        imageUrl: publishedMatch?.imageUrl ?? null,
        venueName: publishedMatch?.venue.name ?? '',
        venueCity: publishedMatch?.venue.city ?? '',
        formatName: publishedMatch?.format?.name ?? '',
        issues: event.issues,
        isReview: true,
      }
    })
  }

  return catalogEvents.value.map(event => ({
    id: event.id,
    title: event.name,
    to: `/admin/events/${event.id}/edit`,
    eventDate: event.eventDate,
    status: event.status,
    imageUrl: getCatalogEventImage(event),
    venueName: event.venue.name,
    venueCity: event.venue.city,
    formatName: event.format?.name ?? '',
    issues: [],
    isReview: false,
  }))
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

  if (catalogMode.value === 'review') {
    void refreshDashboard()
    return
  }

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

  if (catalogMode.value === 'review') {
    void refreshDashboard()
    return
  }

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
        eyebrow="Catálogo"
        :title="catalogSectionTitle"
        tone="subtle"
      >
        <template #actions>
          <div class="flex items-center gap-3 sm:self-center">
            <BaseButton
              kind="tertiary"
              size="md"
              :disabled="catalogPending || filtersPending"
              @click="resetCatalogFilters"
            >
              Resetear
            </BaseButton>
            <BaseButton
              kind="primary"
              size="md"
              :loading="catalogPending || filtersPending"
              @click="applyCatalogFilters"
            >
              Aplicar
            </BaseButton>
          </div>
        </template>

        <div class="space-y-6">
          <AdminFiltersBar
            v-model:search="filters.search"
            v-model:city="filters.city"
            v-model:genre-id="filters.genreId"
            v-model:format-id="filters.formatId"
            v-model:date-from="filters.dateFrom"
            v-model:date-to="filters.dateTo"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            :genres="genres"
            :formats="formats"
            :loading="catalogPending || filtersPending"
            :show-page-size="catalogMode === 'published'"
            :show-date-range="catalogMode === 'published'"
            :show-genre="catalogMode === 'published'"
            :show-format="catalogMode === 'published'"
            class="w-full"
            @update:page-size="pageSize = Number($event)"
          />

          <div class="rounded-2xl border border-default/70 bg-elevated/35 p-3 text-sm text-toned sm:p-4">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <AdminSegmentedControl
                :items="catalogModeItems"
                :active-value="catalogMode"
                size="md"
                @select="setCatalogMode"
              />

              <div
                v-if="catalogMode === 'published'"
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4"
              >
                <AdminSegmentedControl
                  :items="quickWindowItems"
                  :active-value="quickWindow"
                  size="md"
                  @select="setQuickWindow"
                />
              </div>
            </div>
          </div>

          <AdminPaginationBar
            v-if="catalogMode === 'published'"
            :page="meta.page"
            :total-pages="meta.totalPages"
            :total-items="meta.total"
            :page-size="meta.limit"
            :pending="catalogPending"
            @change="goToCatalogPage"
          />

          <div v-if="catalogMode === 'review'" class="flex flex-col gap-3 border-y border-default/70 py-3 text-sm text-toned sm:flex-row sm:items-center sm:justify-between">
            <p class="font-medium text-highlighted">
              {{ catalogSummary }}
            </p>
            <BaseBadge kind="info" size="sm">
              {{ priorityIssueCount }} alertas
            </BaseBadge>
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
              v-for="event in catalogListItems"
              v-else
              :key="event.id"
              :title="event.title"
              :to="event.to"
              :event-date="event.eventDate"
              :venue-name="event.venueName"
              :venue-city="event.venueCity"
              :image-url="event.imageUrl"
              :status="event.isReview ? '' : event.status"
            >
              <template #badges>
                <BaseBadge kind="status" :color="getEventStatusColor(event.status)" size="sm">
                  {{ event.status }}
                </BaseBadge>
                <BaseBadge v-if="event.formatName" kind="tag" size="sm">
                  {{ event.formatName }}
                </BaseBadge>
                <BaseBadge v-if="event.isReview" kind="info" size="sm">
                  Revisión
                </BaseBadge>
                <BaseBadge v-if="event.isReview" kind="status" color="warning" size="sm">
                  {{ event.issues.length }} alertas
                </BaseBadge>
              </template>

              <template #details>
                <p v-if="event.isReview && event.issues.length > 0" class="flex items-start gap-2 text-sm text-toned">
                  <UIcon name="i-lucide-alert-triangle" class="mt-0.5 size-4 shrink-0 text-warning" />
                  <span>
                    {{ event.issues.join(' · ') }}
                  </span>
                </p>
              </template>

              <template #actions>
                <BaseButton kind="secondary" size="sm" class="!rounded-md border-default/55 bg-default/55 hover:bg-default/70" :to="event.to">
                  Editar
                </BaseButton>
                <AdminDeleteAction
                  v-if="!event.isReview"
                  item-label="el evento"
                  trigger-kind="secondary"
                  trigger-class="!rounded-md border-error/35 text-error hover:border-error/50 hover:bg-error/12 hover:text-error"
                  :pending="deletingEventId === event.id"
                  @confirm="removeEvent(event.id)"
                />
              </template>
            </AdminEventRow>
          </div>

          <AdminPaginationBar
            v-if="catalogMode === 'published'"
            :page="meta.page"
            :total-pages="meta.totalPages"
            :total-items="meta.total"
            :page-size="meta.limit"
            :pending="catalogPending"
            @change="goToCatalogPage"
          />
        </div>
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
