<script setup lang="ts">
const genreCardLayoutPattern = [
  'lg:col-span-3 xl:col-span-4',
  'lg:col-span-3 xl:col-span-2',
  'lg:col-span-2 xl:col-span-2',
  'lg:col-span-4 xl:col-span-4',
  'lg:col-span-2 xl:col-span-2',
  'lg:col-span-4 xl:col-span-4',
] as const

const genreCardVariantPattern = [
  'prism',
  'constellation',
  'monolith',
  'prism',
  'monolith',
  'constellation',
] as const

const { data: genres, pending } = useGenres()
const { genre } = useEventSearch()
const { scrollToSection } = useSectionScroll()

const activeGenre = computed(() => {
  return genre.value
})

const activeGenreName = computed(() => {
  if (!genres.value || !activeGenre.value) {
    return ''
  }

  return genres.value.find(genre => genre.slug === activeGenre.value)?.name ?? ''
})

const hasActiveGenre = computed(() => {
  return Boolean(activeGenre.value)
})

async function handleGenreSelect(slug: string) {
  genre.value = genre.value === slug ? '' : slug
  scrollToSection('eventos')
}

function clearGenreFilter() {
  if (!genre.value) {
    return
  }

  genre.value = ''
}

function genreCardLayoutClass(index: number): string {
  return genreCardLayoutPattern[index % genreCardLayoutPattern.length] ?? ''
}

function genreCardVariant(index: number): 'prism' | 'constellation' | 'monolith' {
  return genreCardVariantPattern[index % genreCardVariantPattern.length] ?? 'prism'
}
</script>

<template>
  <SharedBaseSection id="generos">
    <SharedSectionHeading
      eyebrow="Navegacion fractal"
      title="Mapa de universos sonoros"
      description="Traza rutas por genero con una composicion fractal que reordena el cartel en tiempo real."
    />

    <div class="vtx-flow-banner mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-[0.62rem] tracking-[0.22em] text-primary uppercase">
          Rastro activo
        </p>
        <p class="mt-1 text-sm text-toned">
          {{ hasActiveGenre ? `Universo actual: ${activeGenreName}` : 'Sin filtro activo: explora el mapa completo' }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full border border-default/70 bg-default/55 px-3 py-1 text-[0.62rem] tracking-[0.16em] text-toned uppercase">
          {{ pending ? 'Sincronizando' : `${genres?.length ?? 0} generos` }}
        </span>

        <SharedCTAButton
          v-if="hasActiveGenre"
          label="Limpiar filtro"
          tone="secondary"
          variant="outline"
          size="sm"
          @click="clearGenreFilter"
        />
      </div>
    </div>

    <div v-if="pending" class="vtx-fractal-field mt-8 p-4 sm:p-6">
      <div class="vtx-universe-grid grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8">
        <USkeleton
          v-for="i in 6"
          :key="`genre-skeleton-${i}`"
          class="rounded-2xl"
          :class="
            i % 3 === 0
              ? 'h-52 md:col-span-2 lg:col-span-3 xl:col-span-4'
              : i % 3 === 1
                ? 'h-44 lg:col-span-3 xl:col-span-2'
                : 'h-48 lg:col-span-2 xl:col-span-2'
          "
        />
      </div>
    </div>

    <div v-else class="vtx-fractal-field mt-8 p-4 sm:p-6">
      <div class="vtx-universe-grid vtx-stagger grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8">
        <GenresGenreCard
          v-for="(genreItem, index) in genres"
          :key="genreItem.id"
          :genre="genreItem"
          :active="activeGenre === genreItem.slug"
          :variant="genreCardVariant(index)"
          :class="genreCardLayoutClass(index)"
          @select="handleGenreSelect"
        />
      </div>
    </div>
  </SharedBaseSection>
</template>

<style scoped>
.vtx-flow-banner {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(145 161 190 / 0.34);
  border-radius: 1rem;
  background:
    linear-gradient(150deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.02)),
    linear-gradient(136deg, rgb(13 19 35 / 0.84), rgb(17 26 44 / 0.85));
}

.vtx-flow-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-conic-gradient(
    from 0deg at 85% 22%,
    rgb(240 100 127 / 0.18) 0deg,
    rgb(255 255 255 / 0) 14deg,
    rgb(44 189 230 / 0.15) 24deg,
    rgb(255 255 255 / 0) 34deg
  );
  opacity: 0.38;
}

.vtx-fractal-field {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(145 161 190 / 0.34);
  border-radius: 1.2rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.02)),
    linear-gradient(130deg, rgb(11 16 29 / 0.82), rgb(17 24 39 / 0.86));
}

.vtx-fractal-field::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    repeating-conic-gradient(
      from 22deg at 22% 28%,
      rgb(255 255 255 / 0.045) 0deg,
      rgb(255 255 255 / 0) 28deg,
      rgb(255 255 255 / 0.028) 42deg,
      rgb(255 255 255 / 0) 70deg
    ),
    repeating-linear-gradient(
      0deg,
      rgb(255 255 255 / 0.03),
      rgb(255 255 255 / 0.03) 1px,
      transparent 1px,
      transparent 24px
    ),
    repeating-linear-gradient(
      90deg,
      rgb(255 255 255 / 0.03),
      rgb(255 255 255 / 0.03) 1px,
      transparent 1px,
      transparent 24px
    );
  opacity: 0.78;
}

.vtx-universe-grid {
  align-items: stretch;
}

.vtx-universe-grid > * {
  min-width: 0;
}
</style>
