<script setup lang="ts">
import type {
  AdminEventRecord,
  AdminOption,
  AdminRequiresAttentionRecord,
  GenreOption,
  PaginatedMeta,
  PaginatedResponse,
} from '~/types'
import type {
  CatalogEventListItem,
  CatalogMode,
  QuickWindow,
} from '~/utils/admin/eventsCatalog'
import {
  buildCatalogQuery,
  buildCatalogSummary,
  CATALOG_MODE_ITEMS,
  createCatalogListItems,
  getEventStatusColor,
  isCatalogMode,
  isQuickWindow,
  PAGE_SIZE_OPTIONS,
  QUICK_WINDOW_OPTIONS,
} from '~/utils/admin/eventsCatalog'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Operaciones de eventos | VeriTix' })

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
const pageSizeOptions = PAGE_SIZE_OPTIONS
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

const quickWindowOptions = QUICK_WINDOW_OPTIONS

const quickWindowItems = computed(() => {
  return quickWindowOptions.map(option => ({
    value: option.value,
    label: option.label,
  }))
})

function setQuickWindow(value: string) {
  if (isQuickWindow(value)) {
    quickWindow.value = value
  }
}

const priorityIssueCount = computed(() => {
  return requiresAttention.value.reduce((total, event) => total + event.issues.length, 0)
})

const catalogModeItems = computed(() => {
  return CATALOG_MODE_ITEMS
})

const catalogSectionTitle = computed(() => {
  return catalogMode.value === 'review' ? 'Revisión' : 'Catálogo publicado'
})

const catalogSummary = computed(() => {
  return buildCatalogSummary({
    catalogMode: catalogMode.value,
    requiresAttentionCount: requiresAttention.value.length,
    meta: meta.value,
  })
})

const catalogListItems = computed<CatalogEventListItem[]>(() => {
  return createCatalogListItems({
    catalogMode: catalogMode.value,
    catalogEvents: catalogEvents.value,
    requiresAttention: requiresAttention.value,
  })
})

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
      query: buildCatalogQuery({
        pageValue: targetPage,
        pageSize: pageSize.value,
        filters,
        quickWindow: quickWindow.value,
      }),
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
  if (isCatalogMode(value)) {
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
            :visible-filters="catalogMode === 'published' ? ['city', 'pageSize', 'genre', 'format', 'dateRange'] : ['city']"
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
                <BaseButton kind="secondary" size="sm" class="rounded-md! border-default/55 bg-default/55 hover:bg-default/70" :to="event.to">
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
