<script setup lang="ts">
const { query, execute, results, pending } = useEventSearch()

async function onSearch() {
  await execute()

  if (import.meta.client) {
    document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <SharedBaseSection id="hero">
    <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div class="space-y-8 vtx-reveal">
        <p class="text-xs tracking-[0.28em] text-secondary uppercase">
          Plataforma de ticketing inmersiva
        </p>

        <h1 class="font-display text-5xl leading-tight text-highlighted md:text-6xl lg:text-7xl">
          Veritix
        </h1>

        <p class="max-w-2xl text-base leading-relaxed text-toned md:text-lg">
          Descubre conciertos irrepetibles con una estetica que convierte la compra de entradas en una experiencia memorable.
        </p>

        <form
          class="flex flex-col gap-3 sm:flex-row"
          @submit.prevent="onSearch"
        >
          <UInput
            v-model="query"
            placeholder="Busca artista, ciudad o genero"
            leading-icon="i-lucide-search"
            color="neutral"
            variant="subtle"
            class="w-full"
          />

          <SharedCTAButton
            type="submit"
            label="Buscar eventos"
            tone="primary"
          />
        </form>

        <p class="text-sm text-muted">
          {{ pending ? 'Actualizando listado...' : `Eventos visibles: ${results.length}` }}
        </p>
      </div>

      <div class="vtx-reveal">
        <SharedPsychedelicOrb />
      </div>
    </div>
  </SharedBaseSection>
</template>
