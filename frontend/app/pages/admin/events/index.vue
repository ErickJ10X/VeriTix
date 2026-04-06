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
const lastUpdatedAt = ref('')
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

const activeFilterCount = computed(() => {
  return [
    filters.search.trim(),
    filters.city.trim(),
    filters.genreId,
    filters.formatId,
    filters.dateFrom,
    filters.dateTo,
    quickWindow.value !== 'all' ? quickWindow.value : '',
  ].filter(Boolean).length
})

const metrics = computed(() => {
  const now = Date.now()
  const visibleUpcoming = events.value.filter(event => new Date(event.eventDate).getTime() >= now).length
  const withoutFormat = events.value.filter(event => !event.format).length
  const cityCount = new Set(events.value.map(event => event.venue.city)).size

  return [
    {
      label: 'Resultados totales',
      value: `${meta.value.total}`,
      hint: 'Número total de eventos que cumplen la búsqueda y los filtros activos.',
      icon: 'i-lucide-waveform',
      accentClass: 'from-auric',
    },
    {
      label: 'Próximos en vista',
      value: `${visibleUpcoming}`,
      hint: 'Eventos futuros dentro de la página actual cargada en la sala de control.',
      icon: 'i-lucide-calendar-range',
      accentClass: 'from-cyan',
    },
    {
      label: 'Ciudades visibles',
      value: `${cityCount}`,
      hint: 'Distribución urbana inmediata para leer el mapa operativo del catálogo.',
      icon: 'i-lucide-map-pinned',
      accentClass: 'from-rose',
    },
    {
      label: 'Sin formato',
      value: `${withoutFormat}`,
      hint: 'Eventos que aún no tienen una capa curatorial definida en esta vista.',
      icon: 'i-lucide-disc-3',
      accentClass: 'from-verdant',
    },
  ]
})

const hasEvents = computed(() => events.value.length > 0)

const highlightedEvents = computed(() => {
  return [...events.value]
    .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime())
    .slice(0, 3)
})

const resultSummary = computed(() => {
  if (meta.value.total === 0) {
    return 'No hay eventos para la combinación actual.'
  }

  const start = (meta.value.page - 1) * meta.value.limit + 1
  const end = Math.min(meta.value.page * meta.value.limit, meta.value.total)

  return `Mostrando ${start}-${end} de ${meta.value.total} eventos.`
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
    return {
      dateFrom: now.toISOString(),
      dateTo: undefined,
    }
  }

  if (quickWindow.value === 'past') {
    return {
      dateFrom: undefined,
      dateTo: now.toISOString(),
    }
  }

  if (quickWindow.value === 'thisMonth') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return {
      dateFrom: monthStart.toISOString(),
      dateTo: monthEnd.toISOString(),
    }
  }

  return {
    dateFrom: undefined,
    dateTo: undefined,
  }
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
  return new Date(value).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatDateShort(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
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

function getEventImage(event: AdminEventRecord) {
  if (event.imageUrl) {
    return event.imageUrl
  }

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
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los filtros curatoriales.')
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
    lastUpdatedAt.value = new Date().toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar la sala de control de eventos.')
  }
  finally {
    pending.value = false
  }
}

async function removeEvent(eventId: string) {
  deletingEventId.value = eventId

  try {
    await apiRequest(`/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })

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

function changePageSize(event: Event) {
  const target = event.target as HTMLSelectElement
  pageSize.value = Number(target.value)
  page.value = 1
  void loadEvents(1)
}

function goToPage(nextPage: number) {
  void loadEvents(nextPage)
}

onMounted(() => {
  void Promise.all([
    loadFilterOptions(),
    loadEvents(),
  ])
})
</script>

<template>
  <AdminPageShell
    title="Eventos admin"
    description="Una sala de control para leer el catálogo, detectar huecos curatoriales y operar el ciclo completo de cada evento sin fricción."
    primary-action-to="/admin/events/new"
    primary-action-label="Nuevo evento"
  >
    <div class="space-y-6" data-testid="admin-events-page">
      <section class="vtx-events-hero">
        <div class="vtx-events-hero__glow" aria-hidden="true" />

        <div class="relative z-10 grid gap-6 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
          <div class="space-y-5">
            <div class="space-y-3">
              <p class="text-[0.68rem] font-semibold tracking-[0.28em] text-dimmed uppercase">
                Operativa musical
              </p>
              <h2 class="font-display text-3xl text-highlighted sm:text-[2.8rem]">
                Menos listado plano, más pulso del calendario.
              </h2>
              <p class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
                Busca por nombre, filtra por ciudad, género, formato o ventana temporal, y baja directo a edición o eliminación desde una única superficie legible.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <span class="vtx-events-hero__pill">
                {{ meta.total }} eventos encontrados
              </span>
              <span class="vtx-events-hero__pill">
                {{ activeFilterCount }} filtros activos
              </span>
              <span class="vtx-events-hero__pill">
                {{ lastUpdatedAt ? `Actualizado ${lastUpdatedAt}` : 'Cargando lectura operativa' }}
              </span>
            </div>
          </div>

          <div class="vtx-events-hero__rail">
            <div class="space-y-2">
              <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-dimmed uppercase">
                Acciones rápidas
              </p>
              <p class="text-sm leading-relaxed text-toned">
                Salta al alta de un nuevo show o recarga esta vista cuando necesites refrescar la operación.
              </p>
            </div>

            <div class="flex flex-col gap-3">
              <BasePrimaryButton to="/admin/events/new" size="lg" block>
                Crear evento
              </BasePrimaryButton>
              <BaseSecondaryButton size="lg" block :disabled="pending" @click="loadEvents(page)">
                Refrescar vista
              </BaseSecondaryButton>
            </div>
          </div>
        </div>
      </section>

      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

      <section class="vtx-events-toolbar">
        <div class="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
          <UFormField label="Buscar evento">
            <BaseFormInput
              v-model="filters.search"
              placeholder="Nombre del evento o serie"
              size="xl"
              @keyup.enter="applyFilters"
            >
              <template #leading>
                <UIcon name="i-lucide-search" class="size-4 text-dimmed" />
              </template>
            </BaseFormInput>
          </UFormField>

          <UFormField label="Ciudad">
            <BaseFormInput
              v-model="filters.city"
              placeholder="Granada, Madrid..."
              size="xl"
              @keyup.enter="applyFilters"
            >
              <template #leading>
                <UIcon name="i-lucide-map-pin" class="size-4 text-dimmed" />
              </template>
            </BaseFormInput>
          </UFormField>

          <UFormField label="Resultados por página">
            <select :value="pageSize" class="vtx-events-select" @change="changePageSize">
              <option :value="12">
                12 por página
              </option>
              <option :value="24">
                24 por página
              </option>
              <option :value="36">
                36 por página
              </option>
            </select>
          </UFormField>
        </div>

        <div class="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_auto]">
          <UFormField label="Género">
            <select v-model="filters.genreId" class="vtx-events-select" :disabled="filtersPending">
              <option value="">
                Todos los géneros
              </option>
              <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                {{ genre.name }}
              </option>
            </select>
          </UFormField>

          <UFormField label="Formato">
            <select v-model="filters.formatId" class="vtx-events-select" :disabled="filtersPending">
              <option value="">
                Todos los formatos
              </option>
              <option v-for="format in formats" :key="format.id" :value="format.id">
                {{ format.name }}
              </option>
            </select>
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Desde">
              <BaseFormInput v-model="filters.dateFrom" type="date" size="xl" />
            </UFormField>

            <UFormField label="Hasta">
              <BaseFormInput v-model="filters.dateTo" type="date" size="xl" />
            </UFormField>
          </div>

          <div class="flex items-end gap-3">
            <BasePrimaryButton class="flex-1" size="lg" :loading="pending" :disabled="pending" @click="applyFilters">
              Aplicar
            </BasePrimaryButton>
            <BaseTertiaryButton size="lg" :disabled="pending" @click="resetFilters">
              Limpiar
            </BaseTertiaryButton>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in quickWindowOptions"
            :key="option.value"
            type="button"
            class="vtx-events-chip"
            :class="quickWindow === option.value && 'vtx-events-chip--active'"
            @click="changeQuickWindow(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <div class="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
        <AdminDashboardPanel
          eyebrow="Catálogo filtrado"
          title="Mesa operativa de eventos"
          description="Una lectura compacta y accionable para entrar a edición, detectar huecos y limpiar el calendario sin ruido.
"
          icon="i-lucide-list-music"
          accent-class="from-auric"
          to="/admin/events/new"
          action-label="Crear otro evento"
        >
          <div class="space-y-5">
            <div class="flex flex-col gap-3 border-b border-default/60 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <p class="text-sm text-toned">
                {{ resultSummary }}
              </p>
              <UBadge color="neutral" variant="soft">
                Página {{ meta.page }} de {{ meta.totalPages }}
              </UBadge>
            </div>

            <div v-if="pending" class="space-y-3">
              <USkeleton v-for="index in 5" :key="index" class="h-20 rounded-2xl" />
            </div>

            <div v-else-if="!hasEvents" class="vtx-events-empty-state">
              No encontramos eventos con esa combinación. Prueba otra ciudad, abre la ventana temporal o limpia la búsqueda para volver a respirar el catálogo.
            </div>

            <div v-else class="space-y-3">
              <article v-for="event in events" :key="event.id" class="vtx-events-row">
                <div class="flex items-start gap-4">
                  <img :src="getEventImage(event)" :alt="event.name" class="vtx-events-row__image">

                  <div class="min-w-0 flex-1 space-y-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge :color="getEventStatusColor(event.status)" variant="soft">
                        {{ event.status }}
                      </UBadge>
                      <span class="text-xs text-dimmed">
                        {{ event.currency }}
                      </span>
                      <span v-if="event.format" class="vtx-events-row__tag">
                        {{ event.format.name }}
                      </span>
                    </div>

                    <div class="space-y-1">
                      <NuxtLink :to="`/admin/events/${event.id}/edit`" class="vtx-events-row__title">
                        {{ event.name }}
                      </NuxtLink>
                      <p class="text-sm text-toned">
                        {{ event.venue.name }} · {{ event.venue.city }}
                      </p>
                    </div>

                    <div class="flex flex-wrap gap-2 text-xs text-dimmed">
                      <span class="vtx-events-row__meta-pill">{{ formatDate(event.eventDate) }}</span>
                      <span class="vtx-events-row__meta-pill">Edición directa</span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center justify-end gap-2">
                  <BaseSecondaryButton :to="`/admin/events/${event.id}/edit`" size="sm">
                    Editar
                  </BaseSecondaryButton>
                  <AdminDeleteAction
                    item-label="el evento"
                    test-id="admin-event-delete-button"
                    :pending="deletingEventId === event.id"
                    @confirm="removeEvent(event.id)"
                  />
                </div>
              </article>
            </div>

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
        </AdminDashboardPanel>

        <div class="space-y-6">
          <AdminDashboardPanel
            eyebrow="Atajos curatoriales"
            title="Radar inmediato"
            description="Los tres eventos más cercanos para entrar rápido en edición y mantener el calendario bajo control."
            icon="i-lucide-radio"
            accent-class="from-cyan"
            to="/admin/events/new"
            action-label="Lanzar nuevo evento"
          >
            <div v-if="pending" class="space-y-3">
              <USkeleton v-for="index in 3" :key="index" class="h-18 rounded-2xl" />
            </div>

            <div v-else-if="highlightedEvents.length === 0" class="vtx-events-empty-state">
              Cuando haya eventos visibles, aquí aparecerán los accesos más inmediatos.
            </div>

            <div v-else class="space-y-3">
              <NuxtLink
                v-for="event in highlightedEvents"
                :key="event.id"
                :to="`/admin/events/${event.id}/edit`"
                class="vtx-events-mini-row"
              >
                <div>
                  <p class="text-sm font-semibold text-highlighted">
                    {{ event.name }}
                  </p>
                  <p class="mt-1 text-xs text-toned">
                    {{ event.venue.city }} · {{ event.format?.name ?? 'Sin formato' }}
                  </p>
                </div>

                <span class="text-xs font-medium text-dimmed">
                  {{ formatDateShort(event.eventDate) }}
                </span>
              </NuxtLink>
            </div>
          </AdminDashboardPanel>

          <AdminDashboardPanel
            eyebrow="Lectura del filtro"
            title="Qué estás mirando"
            description="Una explicación mínima del estado actual de la vista para que la interfaz se entienda sola sin recargarte de mensajes."
            icon="i-lucide-equal-not"
            accent-class="from-rose"
            to="/admin/events"
            action-label="Ver catálogo completo"
          >
            <div class="grid gap-3">
              <article class="vtx-events-note-card">
                <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                  Búsqueda
                </p>
                <p class="mt-2 text-sm text-highlighted">
                  {{ filters.search.trim() || 'Sin término activo' }}
                </p>
              </article>

              <article class="vtx-events-note-card">
                <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                  Ciudad / ventana
                </p>
                <p class="mt-2 text-sm text-highlighted">
                  {{ filters.city.trim() || 'Todas las ciudades' }} · {{ quickWindowOptions.find(option => option.value === quickWindow)?.label }}
                </p>
              </article>

              <article class="vtx-events-note-card">
                <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
                  Curaduría
                </p>
                <p class="mt-2 text-sm text-highlighted">
                  {{ genres.find(genre => genre.id === filters.genreId)?.name || 'Todos los géneros' }} · {{ formats.find(format => format.id === filters.formatId)?.name || 'Todos los formatos' }}
                </p>
              </article>
            </div>
          </AdminDashboardPanel>
        </div>
      </div>
    </div>
  </AdminPageShell>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-events-hero {
  @apply relative overflow-hidden rounded-[2rem] border p-6 sm:p-7 lg:p-8;
  border-color: color-mix(in srgb, var(--ui-border-accented) 24%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.055), rgb(255 255 255 / 0.015)),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--ui-bg) 90%, black),
      color-mix(in srgb, var(--ui-bg-elevated) 84%, black)
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    0 30px 60px -44px rgb(5 10 20 / 0.94);
}

.vtx-events-hero__glow {
  @apply pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full blur-3xl;
  background:
    radial-gradient(circle at center, color-mix(in srgb, var(--color-auric-400) 32%, transparent), transparent 66%),
    radial-gradient(circle at 30% 70%, color-mix(in srgb, var(--color-nebula-400) 26%, transparent), transparent 70%);
  opacity: 0.92;
}

.vtx-events-hero__rail {
  @apply rounded-[1.6rem] border p-5;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg-elevated) 58%, transparent);
}

.vtx-events-hero__pill {
  @apply inline-flex items-center rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.16em] uppercase;
  border-color: color-mix(in srgb, var(--ui-border-accented) 16%, transparent);
  background: color-mix(in srgb, var(--ui-bg-accented) 34%, transparent);
  color: var(--ui-text-highlighted);
}

.vtx-events-toolbar {
  @apply rounded-[1.8rem] border p-5 sm:p-6;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg-elevated) 56%, transparent);
}

.vtx-events-select {
  @apply w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-150;
  border-color: color-mix(in srgb, var(--ui-border-accented) 26%, transparent);
  background: color-mix(in srgb, var(--ui-bg) 72%, transparent);
  color: var(--ui-text-highlighted);
}

.vtx-events-select:focus {
  border-color: color-mix(in srgb, var(--color-auric-400) 48%, transparent);
  box-shadow: 0 0 0 3px rgb(239 170 71 / 0.08);
}

.vtx-events-chip {
  @apply inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-150;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background: color-mix(in srgb, var(--ui-bg-accented) 18%, transparent);
  color: var(--ui-text-toned);
}

.vtx-events-chip:hover,
.vtx-events-chip--active {
  border-color: color-mix(in srgb, var(--color-auric-400) 44%, transparent);
  background:
    linear-gradient(135deg, rgb(239 170 71 / 0.14), rgb(44 189 230 / 0.1)),
    color-mix(in srgb, var(--ui-bg-elevated) 48%, transparent);
  color: var(--ui-text-highlighted);
}

.vtx-events-row {
  @apply grid gap-4 rounded-[1.6rem] border p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.035), rgb(255 255 255 / 0.01)),
    color-mix(in srgb, var(--ui-bg) 54%, transparent);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
}

.vtx-events-row__image {
  @apply size-16 rounded-2xl object-cover;
  border: 1px solid color-mix(in srgb, var(--ui-border-accented) 20%, transparent);
  background: color-mix(in srgb, var(--ui-bg-elevated) 62%, transparent);
}

.vtx-events-row__title {
  @apply text-base font-semibold text-highlighted transition-colors duration-150;
}

.vtx-events-row__title:hover {
  color: var(--color-auric-300);
}

.vtx-events-row__tag,
.vtx-events-row__meta-pill {
  @apply inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-medium;
  border-color: color-mix(in srgb, var(--ui-border-accented) 16%, transparent);
  background: color-mix(in srgb, var(--ui-bg-accented) 24%, transparent);
}

.vtx-events-row__tag {
  color: var(--ui-text-highlighted);
}

.vtx-events-row__meta-pill {
  color: var(--ui-text-toned);
}

.vtx-events-mini-row {
  @apply flex items-center justify-between gap-3 rounded-[1.4rem] border px-4 py-3 transition-all duration-150;
  border-color: color-mix(in srgb, var(--ui-border-accented) 16%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.035), rgb(255 255 255 / 0.01)),
    color-mix(in srgb, var(--ui-bg) 52%, transparent);
}

.vtx-events-mini-row:hover {
  border-color: color-mix(in srgb, var(--color-nebula-400) 34%, transparent);
  transform: translateY(-1px);
}

.vtx-events-note-card,
.vtx-events-empty-state {
  @apply rounded-[1.35rem] border px-4 py-4;
  border-color: color-mix(in srgb, var(--ui-border-accented) 16%, transparent);
  background: color-mix(in srgb, var(--ui-bg-accented) 24%, transparent);
}

.vtx-events-empty-state {
  @apply text-sm leading-relaxed;
  color: var(--ui-text-toned);
}
</style>
