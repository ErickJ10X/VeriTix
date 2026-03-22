<script setup lang="ts">
const { query, results, pending } = useEventSearch()
const { scrollToSection } = useSectionScroll()

function onSearch() {
  scrollToSection('eventos')
}
</script>

<template>
  <SharedBaseSection id="hero">
    <div class="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div class="pointer-events-none absolute -left-6 top-6 hidden h-24 w-24 rotate-45 border border-secondary/35 lg:block" />
      <div class="pointer-events-none absolute -right-4 bottom-8 hidden h-16 w-16 rounded-full border border-primary/40 lg:block" />

      <div class="space-y-8 vtx-reveal">
        <h1 class="font-display text-5xl leading-[0.94] text-highlighted md:text-6xl lg:text-7xl">
          Veritix
          <span class="vtx-prismatic-text mt-2 block text-3xl md:text-4xl lg:text-5xl">
            Atlas de conciertos visionarios
          </span>
        </h1>

        <p class="max-w-2xl text-base leading-relaxed text-toned md:text-lg">
          Descubre fechas irrepetibles en una experiencia ritual: sombras profundas, prismas electricos y composicion mistica inspirada por Pink Floyd, Yes y King Crimson.
        </p>

        <form class="vtx-search-shell" @submit.prevent="onSearch">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-[0.62rem] tracking-[0.22em] text-primary uppercase">
                Sintonizador
              </p>
              <p class="mt-1 text-sm text-toned">
                Busca por artista, ciudad o genero con contraste alto y lectura inmediata.
              </p>
            </div>

            <span class="rounded-full border border-secondary/45 bg-secondary/12 px-2.5 py-1 text-[0.58rem] tracking-[0.2em] text-secondary uppercase">
              Ritual en vivo
            </span>
          </div>

          <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label class="sr-only" for="hero-search">
              Buscar eventos
            </label>

            <UInput
              id="hero-search"
              v-model="query"
              placeholder="Busca artista, ciudad o genero"
              leading-icon="i-lucide-search"
              color="neutral"
              variant="subtle"
              aria-label="Buscar eventos"
              class="w-full sm:flex-1"
            />

            <SharedCTAButton
              type="submit"
              label="Buscar ritual"
              tone="primary"
              variant="solid"
              size="md"
              class="vtx-search-action sm:min-w-44"
            />
          </div>
        </form>

        <div class="flex flex-wrap items-center gap-3">
          <p class="text-sm text-toned">
            {{ pending ? 'Actualizando cartel...' : `Eventos visibles: ${results.length}` }}
          </p>

          <SharedCTAButton
            href="#generos"
            label="Explorar generos"
            tone="secondary"
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      <div class="vtx-reveal">
        <SharedPsychedelicOrb />
      </div>
    </div>
  </SharedBaseSection>
</template>

<style scoped>
.vtx-search-shell {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(145 161 190 / 0.45);
  border-radius: 1rem;
  padding: 1rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.02)),
    linear-gradient(130deg, rgb(10 15 28 / 0.88), rgb(16 24 43 / 0.9));
  box-shadow:
    0 24px 40px -32px rgb(0 0 0 / 0.8),
    inset 0 0 0 1px rgb(255 255 255 / 0.04);
}

.vtx-search-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 14% 20%, rgb(239 170 71 / 0.18), rgb(255 255 255 / 0) 46%),
    radial-gradient(circle at 88% 78%, rgb(20 128 188 / 0.2), rgb(255 255 255 / 0) 42%);
}

.vtx-search-shell::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgb(239 170 71 / 0),
    rgb(239 170 71 / 0.7),
    rgb(20 128 188 / 0.65),
    rgb(239 170 71 / 0)
  );
}

.vtx-search-shell :deep(.vtx-search-action) {
  border-color: rgb(248 194 103 / 0.9);
  background: linear-gradient(145deg, rgb(254 221 166 / 0.96), rgb(239 170 71 / 0.94));
  color: rgb(31 23 12 / 0.96);
  box-shadow:
    0 14px 26px -16px rgb(239 170 71 / 0.74),
    inset 0 1px 0 rgb(255 255 255 / 0.46);
  text-shadow: none;
}

.vtx-search-shell :deep(.vtx-search-action:hover),
.vtx-search-shell :deep(.vtx-search-action:focus-visible) {
  color: rgb(22 15 9 / 0.98);
  background: linear-gradient(145deg, rgb(255 232 191 / 0.98), rgb(248 194 103 / 0.96));
}

.vtx-reveal {
  animation: hero-reveal 920ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .vtx-reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes hero-reveal {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
