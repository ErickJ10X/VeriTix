<script setup lang="ts">
const route = useRoute()
const { getApiErrorMessage } = useApiErrorMessage()

function readQueryValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function readQueryPage(value: unknown): number {
  const page = Number(value)

  if (Number.isInteger(page) && page > 0) {
    return page
  }

  return 1
}

useSeoMeta({
  title: 'Eventos | VeriTix',
  description: 'Explora conciertos y experiencias en vivo con filtros por género y ciudad.',
})

const searchDraft = ref(readQueryValue(route.query.search))
const artistNameDraft = ref('')
const showAllGenres = ref(false)

const filters = computed(() => {
  return {
    search: readQueryValue(route.query.search),
    genreId: readQueryValue(route.query.genreId),
    city: readQueryValue(route.query.city),
    page: readQueryPage(route.query.page),
  }
})

const { data: eventsResponse, status, error } = await usePublicEvents(filters)
const { genres, cities } = useEventCatalogFilters()

const genreOptions = computed(() => {
  return genres.data.value ?? []
})

const cityOptions = computed(() => {
  return cities.value
})

const visibleGenres = computed(() => {
  if (showAllGenres.value || genreOptions.value.length <= 8) {
    return genreOptions.value
  }

  const selectedGenre = genreOptions.value.find(genre => genre.id === filters.value.genreId)
  const leadingGenres = genreOptions.value.slice(0, 8)

  if (selectedGenre && !leadingGenres.some(genre => genre.id === selectedGenre.id)) {
    return [...leadingGenres.slice(0, 7), selectedGenre]
  }

  return leadingGenres
})

const hiddenGenresCount = computed(() => {
  return Math.max(genreOptions.value.length - visibleGenres.value.length, 0)
})

watch(() => filters.value.search, (value) => {
  searchDraft.value = value
})

watch(() => filters.value.genreId, (value) => {
  if (!value) {
    showAllGenres.value = false
  }
})

const events = computed(() => eventsResponse.value?.data ?? [])
const meta = computed(() => {
  return eventsResponse.value?.meta ?? {
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
  }
})

const selectedGenreLabel = computed(() => {
  return genreOptions.value.find(genre => genre.id === filters.value.genreId)?.name ?? ''
})

const resultsHeading = computed(() => {
  return `${meta.value.total} resultado${meta.value.total === 1 ? '' : 's'}`
})

const resultsContext = computed(() => {
  const segments = [
    filters.value.search ? `búsqueda: “${filters.value.search}”` : '',
    selectedGenreLabel.value ? `género: ${selectedGenreLabel.value}` : '',
    filters.value.city ? `ciudad: ${filters.value.city}` : '',
  ].filter(Boolean)

  if (segments.length === 0) {
    return 'Explora la cartelera disponible y encuentra el plan adecuado.'
  }

  return segments.join(' · ')
})

const activeFilterCount = computed(() => {
  return [filters.value.search, filters.value.genreId, filters.value.city].filter(Boolean).length
})
const isPending = computed(() => status.value === 'pending')
const eventsErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  return getApiErrorMessage(error.value, 'No pudimos cargar los eventos en este momento.')
})

const hasActiveFilters = computed(() => {
  return Boolean(filters.value.search || filters.value.genreId || filters.value.city)
})

const filterButtonUi = {
  base: 'border border-default/70 bg-default/65 text-toned shadow-none transition-all duration-150 hover:border-primary/18 hover:bg-elevated hover:text-default focus-visible:border-primary/35 focus-visible:bg-elevated focus-visible:text-default',
} as const

async function updateFilters(next: Partial<typeof filters.value>) {
  const shouldResetPage = next.search !== undefined || next.genreId !== undefined || next.city !== undefined
  const query = {
    search: next.search ?? filters.value.search,
    genreId: next.genreId ?? filters.value.genreId,
    city: next.city ?? filters.value.city,
    page: shouldResetPage ? 1 : (next.page ?? filters.value.page),
  }

  await navigateTo({
    path: '/events',
    query: {
      search: query.search || undefined,
      genreId: query.genreId || undefined,
      city: query.city || undefined,
      page: query.page > 1 ? String(query.page) : undefined,
    },
  })
}

async function submitSearch() {
  // TODO(backend): include `artistName: artistNameDraft.value.trim()` in the public events
  // query once the API supports artist-name filtering end-to-end.
  await updateFilters({ search: searchDraft.value.trim() })
}

async function clearFilters() {
  searchDraft.value = ''
  await navigateTo('/events')
}

async function handlePageChange(page: number) {
  if (page === filters.value.page || isPending.value) {
    return
  }

  await updateFilters({ page })
}
</script>

<template>
  <UiEventsPageShell variant="index" container-class="relative">
    <div class="mx-auto max-w-7xl space-y-7">
      <header class="space-y-4 border-b border-default/55 pb-7">
        <p class="text-[0.68rem] font-semibold tracking-[0.3em] text-secondary uppercase">
          Cartelera
        </p>

        <div>
          <h1 class="font-display text-3xl text-highlighted sm:text-4xl lg:text-[2.85rem]">
            Eventos en vivo
          </h1>
          <p class="mt-2.5 max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
            Descubre la cartelera y encuentra rápido lo que quieres ver.
          </p>
        </div>
      </header>

      <section class="grid gap-7 xl:grid-cols-[292px_minmax(0,1fr)] xl:items-start xl:gap-8">
        <aside class="xl:sticky xl:top-24">
          <div class="rounded-[2rem] border border-default/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),linear-gradient(145deg,rgba(11,17,31,0.68),rgba(16,23,40,0.6))] p-5 shadow-[0_24px_48px_-34px_rgba(0,0,0,0.82)] backdrop-blur-xl sm:p-6">
            <div class="border-b border-default/55 pb-5">
              <div>
                <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-secondary uppercase">
                  Filtros
                </p>
                <h2 class="mt-1.5 text-xl font-semibold text-highlighted">
                  Filtrar eventos
                </h2>
              </div>

              <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap items-center gap-2">
                <p class="text-[0.72rem] font-medium tracking-[0.14em] text-dimmed uppercase">
                  {{ activeFilterCount }} filtro{{ activeFilterCount > 1 ? 's' : '' }} activo{{ activeFilterCount > 1 ? 's' : '' }}
                </p>

                <BaseTertiaryButton
                  size="xs"
                  :disabled="isPending"
                  class="px-2.5"
                  @click="clearFilters"
                >
                  Limpiar todo
                </BaseTertiaryButton>
              </div>
            </div>

            <div class="mt-5 space-y-4.5">
              <section class="rounded-[1.5rem] border border-default/60 bg-default/30 p-4.5">
                <p class="text-[0.68rem] font-semibold tracking-[0.18em] text-dimmed uppercase">
                  Búsqueda
                </p>

                <form class="mt-3.5 space-y-3" @submit.prevent="submitSearch">
                  <BaseFormInput
                    v-model="searchDraft"
                    placeholder="Buscar por evento"
                    icon="i-lucide-search"
                    :disabled="isPending"
                    class="min-w-0"
                  />

                  <BaseFormInput
                    v-model="artistNameDraft"
                    placeholder="Buscar por artista"
                    icon="i-lucide-mic-vocal"
                    class="min-w-0"
                  />

                  <BasePrimaryButton type="submit" size="sm" :loading="isPending" :disabled="isPending" block>
                    Buscar
                  </BasePrimaryButton>
                </form>
              </section>

              <section class="rounded-[1.5rem] border border-default/60 bg-default/30 p-4.5">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-[0.74rem] font-semibold tracking-[0.16em] text-highlighted uppercase">
                    Géneros
                  </h3>
                  <span class="text-[0.65rem] font-medium text-dimmed uppercase tracking-[0.14em]">
                    {{ filters.genreId ? '1 seleccionado' : 'Top' }}
                  </span>
                </div>

                <div class="mt-3.5 flex flex-wrap gap-2.5">
                  <UButton
                    type="button"
                    size="sm"
                    :ui="filterButtonUi"
                    class="rounded-full px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.05em]"
                    :disabled="isPending"
                    :color="!filters.genreId ? 'primary' : 'neutral'"
                    :variant="!filters.genreId ? 'soft' : 'outline'"
                    @click="updateFilters({ genreId: '' })"
                  >
                    Todos
                  </UButton>

                  <UButton
                    v-for="genre in visibleGenres"
                    :key="genre.id"
                    type="button"
                    size="sm"
                    :ui="filterButtonUi"
                    class="rounded-full px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.05em]"
                    :disabled="isPending"
                    :color="filters.genreId === genre.id ? 'primary' : 'neutral'"
                    :variant="filters.genreId === genre.id ? 'soft' : 'outline'"
                    @click="updateFilters({ genreId: genre.id })"
                  >
                    {{ genre.name }}
                  </UButton>
                </div>

                <BaseTertiaryButton
                  v-if="hiddenGenresCount > 0"
                  size="xs"
                  class="mt-3 px-0"
                  :disabled="isPending"
                  @click="showAllGenres = !showAllGenres"
                >
                  {{ showAllGenres ? 'Mostrar menos' : `Ver ${hiddenGenresCount} más` }}
                </BaseTertiaryButton>
              </section>

              <section class="rounded-[1.5rem] border border-default/60 bg-default/30 p-4.5">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-[0.74rem] font-semibold tracking-[0.16em] text-highlighted uppercase">
                    Ubicación
                  </h3>
                  <span class="text-[0.65rem] font-medium text-dimmed uppercase tracking-[0.14em]">
                    {{ filters.city ? '1' : 'Todas' }}
                  </span>
                </div>

                <div class="mt-3.5 flex flex-wrap gap-2.5">
                  <UButton
                    type="button"
                    size="sm"
                    :ui="filterButtonUi"
                    class="rounded-full px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.05em]"
                    :disabled="isPending"
                    :color="!filters.city ? 'primary' : 'neutral'"
                    :variant="!filters.city ? 'soft' : 'outline'"
                    @click="updateFilters({ city: '' })"
                  >
                    Todas
                  </UButton>

                  <UButton
                    v-for="city in cityOptions"
                    :key="city"
                    type="button"
                    size="sm"
                    :ui="filterButtonUi"
                    class="rounded-full px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.05em]"
                    :disabled="isPending"
                    :color="filters.city === city ? 'primary' : 'neutral'"
                    :variant="filters.city === city ? 'soft' : 'outline'"
                    @click="updateFilters({ city })"
                  >
                    {{ city }}
                  </UButton>
                </div>
              </section>
            </div>
          </div>
        </aside>

        <section class="space-y-6">
          <div class="space-y-1 border-b border-default/55 pb-4">
            <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-secondary uppercase">
              Resultados
            </p>
            <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <h2 class="text-2xl font-semibold text-highlighted">
                {{ resultsHeading }}
              </h2>

              <p class="text-sm text-toned sm:text-right">
                {{ resultsContext }}
              </p>
            </div>
          </div>

          <div v-if="isPending" class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            <USkeleton v-for="index in 6" :key="index" class="h-104 rounded-[1.6rem]" />
          </div>

          <div v-else-if="eventsErrorMessage" class="rounded-3xl border border-error/30 bg-error/8 px-6 py-14 text-center">
            <div class="mx-auto flex max-w-md flex-col items-center gap-4">
              <UIcon name="i-lucide-cloud-off" class="size-8 text-error" />
              <div class="space-y-2">
                <p class="text-lg font-semibold text-highlighted">
                  No pudimos cargar la cartelera.
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  {{ eventsErrorMessage }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="events.length === 0" class="rounded-3xl border border-default/65 bg-default/8 px-6 py-14 text-center">
            <p class="text-lg font-semibold text-highlighted">
              No hay eventos para estos filtros.
            </p>
          </div>

          <div v-else class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            <EventsListingCard
              v-for="event in events"
              :key="event.id"
              :event="event"
            />
          </div>

          <div v-if="meta.totalPages > 1" class="flex justify-center border-t border-default/55 pt-5">
            <UPagination
              :page="filters.page"
              :total="meta.total"
              :items-per-page="meta.limit"
              :disabled="isPending"
              :sibling-count="1"
              size="sm"
              color="neutral"
              variant="ghost"
              active-color="primary"
              active-variant="soft"
              show-edges
              @update:page="handlePageChange"
            />
          </div>
        </section>
      </section>
    </div>
  </UiEventsPageShell>
</template>
