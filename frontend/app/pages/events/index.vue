<script setup lang="ts">
const route = useRoute()

useSeoMeta({
  title: 'Eventos | VeriTix',
  description: 'Explora conciertos y experiencias en vivo con filtros por genero y ciudad.',
})

const searchDraft = ref(typeof route.query.search === 'string' ? route.query.search : '')

const filters = computed(() => {
  return {
    search: typeof route.query.search === 'string' ? route.query.search : '',
    genreId: typeof route.query.genreId === 'string' ? route.query.genreId : '',
    city: typeof route.query.city === 'string' ? route.query.city : '',
  }
})

const { data: eventsResponse, status } = await usePublicEvents(filters)
const { genres, cities } = useEventCatalogFilters()

const genreOptions = computed(() => {
  return genres.data.value ?? []
})

const cityOptions = computed(() => {
  return cities.value
})

watch(() => filters.value.search, (value) => {
  searchDraft.value = value
})

const events = computed(() => eventsResponse.value?.data ?? [])
const hasActiveFilters = computed(() => {
  return Boolean(filters.value.search || filters.value.genreId || filters.value.city)
})

async function updateFilters(next: Partial<typeof filters.value>) {
  const query = {
    search: next.search ?? filters.value.search,
    genreId: next.genreId ?? filters.value.genreId,
    city: next.city ?? filters.value.city,
  }

  await navigateTo({
    path: '/events',
    query: {
      search: query.search || undefined,
      genreId: query.genreId || undefined,
      city: query.city || undefined,
    },
  })
}

async function submitSearch() {
  await updateFilters({ search: searchDraft.value.trim() })
}

async function clearFilters() {
  searchDraft.value = ''
  await navigateTo('/events')
}
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute inset-x-0 top-0 h-56 bg-linear-to-b from-primary/10 via-transparent to-transparent" />
      <div class="absolute -left-12 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute right-0 top-10 h-64 w-64 rounded-full bg-auric-500/10 blur-3xl" />
    </div>

    <UContainer class="relative">
      <div class="mx-auto max-w-7xl space-y-10">
        <header class="space-y-5 border-b border-default/55 pb-8">
          <div class="flex flex-wrap items-center gap-3">
            <p class="text-[0.68rem] font-semibold tracking-[0.3em] text-secondary uppercase">
              Cartelera
            </p>

            <span class="inline-flex items-center gap-2 rounded-full border border-default/60 bg-default/8 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] text-toned uppercase">
              {{ eventsResponse?.meta.total ?? 0 }} eventos
            </span>
          </div>

          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h1 class="font-display text-3xl text-highlighted sm:text-4xl lg:text-[3.1rem]">
                Eventos en vivo
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
                Filtra por ciudad, genero o busqueda directa.
              </p>
            </div>

            <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submitSearch">
              <UInput
                v-model="searchDraft"
                placeholder="Buscar por evento"
                icon="i-lucide-search"
                color="neutral"
                variant="subtle"
                size="lg"
                class="min-w-0 sm:w-72"
                :ui="{ base: 'h-12' }"
              />

              <UButton type="submit" color="primary" variant="solid" size="lg" class="rounded-full px-5">
                Buscar
              </UButton>
            </form>
          </div>
        </header>

        <div class="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside class="space-y-8 border-t border-default/55 pt-8 xl:border-t-0 xl:border-r xl:border-default/55 xl:pr-8 xl:pt-0">
            <section class="space-y-4">
              <div class="flex items-center justify-between gap-3">
                <h2 class="text-sm font-semibold tracking-[0.16em] text-highlighted uppercase">
                  Generos
                </h2>

                <UButton
                  v-if="hasActiveFilters"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  class="rounded-full"
                  @click="clearFilters"
                >
                  Limpiar
                </UButton>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="vtx-filter-chip"
                  :class="!filters.genreId && 'vtx-filter-chip--active'"
                  @click="updateFilters({ genreId: '' })"
                >
                  Todos
                </button>

                <button
                  v-for="genre in genreOptions"
                  :key="genre.id"
                  type="button"
                  class="vtx-filter-chip"
                  :class="filters.genreId === genre.id && 'vtx-filter-chip--active'"
                  @click="updateFilters({ genreId: genre.id })"
                >
                  {{ genre.name }}
                </button>
              </div>
            </section>

            <section class="space-y-4">
              <h2 class="text-sm font-semibold tracking-[0.16em] text-highlighted uppercase">
                Ubicacion
              </h2>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="vtx-filter-chip"
                  :class="!filters.city && 'vtx-filter-chip--active'"
                  @click="updateFilters({ city: '' })"
                >
                  Todas
                </button>

                <button
                  v-for="city in cityOptions"
                  :key="city"
                  type="button"
                  class="vtx-filter-chip"
                  :class="filters.city === city && 'vtx-filter-chip--active'"
                  @click="updateFilters({ city })"
                >
                  {{ city }}
                </button>
              </div>
            </section>
          </aside>

          <section class="space-y-6">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-toned">
                {{ eventsResponse?.meta.total ?? 0 }} resultados
              </p>

              <p v-if="filters.city || filters.genreId || filters.search" class="text-sm text-dimmed">
                Filtros activos
              </p>
            </div>

            <div v-if="status === 'pending'" class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              <USkeleton v-for="index in 6" :key="index" class="h-116 rounded-3xl" />
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
          </section>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-filter-chip {
  @apply inline-flex items-center rounded-full border px-3 py-2 text-[0.72rem] font-semibold tracking-[0.08em] transition-colors duration-200;
  border-color: rgb(145 161 190 / 0.22);
  background: rgb(255 255 255 / 0.04);
  color: var(--ui-text-toned);
}

.vtx-filter-chip:hover {
  border-color: rgb(239 170 71 / 0.35);
  color: rgb(246 248 255);
}

.vtx-filter-chip--active {
  border-color: rgb(239 170 71 / 0.42);
  background: rgb(239 170 71 / 0.14);
  color: rgb(248 194 103);
}
</style>
