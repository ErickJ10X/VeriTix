<script setup lang="ts">
const route = useRoute()
const { getApiErrorMessage } = useApiErrorMessage()

function readQueryValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

useSeoMeta({
  title: 'Eventos | VeriTix',
  description: 'Explora conciertos y experiencias en vivo con filtros por género y ciudad.',
})

const searchDraft = ref(readQueryValue(route.query.search))

const filters = computed(() => {
  return {
    search: readQueryValue(route.query.search),
    genreId: readQueryValue(route.query.genreId),
    city: readQueryValue(route.query.city),
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

watch(() => filters.value.search, (value) => {
  searchDraft.value = value
})

const events = computed(() => eventsResponse.value?.data ?? [])
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
  <UiEventsPageShell variant="index" container-class="relative">
    <div class="mx-auto max-w-7xl space-y-10">
      <header class="space-y-5 border-b border-default/55 pb-8">
        <div class="flex flex-wrap items-center gap-3">
          <p class="text-[0.68rem] font-semibold tracking-[0.3em] text-secondary uppercase">
            Cartelera
          </p>

          <UBadge
            color="neutral"
            variant="subtle"
            size="xs"
            class="rounded-full px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase"
          >
            {{ eventsResponse?.meta.total ?? 0 }} eventos
          </UBadge>
        </div>

        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 class="font-display text-3xl text-highlighted sm:text-4xl lg:text-[3.1rem]">
              Eventos en vivo
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
              Filtra por ciudad, género o búsqueda directa.
            </p>
          </div>

          <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="submitSearch">
            <BaseFormInput
              v-model="searchDraft"
              placeholder="Buscar por evento"
              icon="i-lucide-search"
              :disabled="isPending"
              class="min-w-0 sm:w-72"
            />

            <BasePrimaryButton type="submit" size="lg" :loading="isPending" :disabled="isPending" class="px-5">
              Buscar
            </BasePrimaryButton>
          </form>
        </div>
      </header>

      <div class="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside class="space-y-8 border-t border-default/55 pt-8 xl:border-t-0 xl:border-r xl:border-default/55 xl:pr-8 xl:pt-0">
          <section class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-sm font-semibold tracking-[0.16em] text-highlighted uppercase">
                Géneros
              </h2>

              <BaseTertiaryButton
                v-if="hasActiveFilters"
                size="xs"
                :disabled="isPending"
                class="px-3"
                @click="clearFilters"
              >
                Limpiar
              </BaseTertiaryButton>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                type="button"
                size="xs"
                class="rounded-full px-3 text-[0.72rem] font-semibold tracking-[0.08em]"
                :disabled="isPending"
                :color="!filters.genreId ? 'primary' : 'neutral'"
                :variant="!filters.genreId ? 'soft' : 'ghost'"
                @click="updateFilters({ genreId: '' })"
              >
                Todos
              </UButton>

              <UButton
                v-for="genre in genreOptions"
                :key="genre.id"
                type="button"
                size="xs"
                class="rounded-full px-3 text-[0.72rem] font-semibold tracking-[0.08em]"
                :disabled="isPending"
                :color="filters.genreId === genre.id ? 'primary' : 'neutral'"
                :variant="filters.genreId === genre.id ? 'soft' : 'ghost'"
                @click="updateFilters({ genreId: genre.id })"
              >
                {{ genre.name }}
              </UButton>
            </div>
          </section>

          <section class="space-y-4">
            <h2 class="text-sm font-semibold tracking-[0.16em] text-highlighted uppercase">
              Ubicación
            </h2>

            <div class="flex flex-wrap gap-2">
              <UButton
                type="button"
                size="xs"
                class="rounded-full px-3 text-[0.72rem] font-semibold tracking-[0.08em]"
                :disabled="isPending"
                :color="!filters.city ? 'primary' : 'neutral'"
                :variant="!filters.city ? 'soft' : 'ghost'"
                @click="updateFilters({ city: '' })"
              >
                Todas
              </UButton>

              <UButton
                v-for="city in cityOptions"
                :key="city"
                type="button"
                size="xs"
                class="rounded-full px-3 text-[0.72rem] font-semibold tracking-[0.08em]"
                :disabled="isPending"
                :color="filters.city === city ? 'primary' : 'neutral'"
                :variant="filters.city === city ? 'soft' : 'ghost'"
                @click="updateFilters({ city })"
              >
                {{ city }}
              </UButton>
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

          <div v-if="isPending" class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            <USkeleton v-for="index in 6" :key="index" class="h-116 rounded-3xl" />
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
        </section>
      </div>
    </div>
  </UiEventsPageShell>
</template>
