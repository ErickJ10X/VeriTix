<script setup lang="ts">
const { data: genres, pending } = useGenres()
const { filters, execute } = useEventSearch()

const activeGenre = computed(() => {
  return filters.value.genre
})

async function handleGenreSelect(slug: string) {
  filters.value.genre = filters.value.genre === slug ? '' : slug
  await execute()

  if (import.meta.client) {
    document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <SharedBaseSection id="generos">
    <SharedSectionHeading
      eyebrow="Navegacion"
      title="Generos"
      description="Filtra rapidamente por estilo musical y concentra tu busqueda en los eventos que te importan."
    />

    <div
      v-if="pending"
      class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <USkeleton
        v-for="i in 5"
        :key="`genre-skeleton-${i}`"
        class="h-36 rounded-2xl"
      />
    </div>

    <div
      v-else
      class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 vtx-stagger"
    >
      <GenresGenreCard
        v-for="genre in genres"
        :key="genre.id"
        :genre="genre"
        :active="activeGenre === genre.slug"
        @select="handleGenreSelect"
      />
    </div>
  </SharedBaseSection>
</template>
