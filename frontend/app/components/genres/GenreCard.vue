<script setup lang="ts">
import type { Genre } from '~/types'

const props = defineProps<{
  genre: Genre
  active?: boolean
  variant?: 'prism' | 'constellation' | 'monolith'
}>()

const emit = defineEmits<{
  select: [slug: string]
}>()

const helperText = computed(() => {
  if (props.active) {
    return 'Filtro activo'
  }

  return 'Activar filtro'
})

const variantMap = {
  prism: {
    motif: 'Prisma',
    cardClass: 'vtx-genre-card--prism',
    titleClass: 'text-[2rem] sm:text-[2.25rem]',
  },
  constellation: {
    motif: 'Nexo',
    cardClass: 'vtx-genre-card--constellation',
    titleClass: 'text-[1.7rem] sm:text-[1.9rem]',
  },
  monolith: {
    motif: 'Pulso',
    cardClass: 'vtx-genre-card--monolith',
    titleClass: 'text-2xl sm:text-[1.75rem]',
  },
} as const

const resolvedVariant = computed(() => {
  return variantMap[props.variant ?? 'prism']
})
</script>

<template>
  <button
    :style="{ '--genre-accent': genre.accent }"
    class="vtx-genre-card group h-full w-full border text-left transition duration-300 hover:-translate-y-1 hover:border-accented focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
    :class="[
      resolvedVariant.cardClass,
      active
        ? 'border-primary/70 bg-accented/35 ring-2 ring-primary/25 shadow-[0_0_0_1px_rgba(239,170,71,0.15)]'
        : 'border-default/65',
    ]"
    type="button"
    @click="emit('select', genre.slug)"
  >
    <div class="relative z-10 mb-3 flex items-start justify-between gap-3">
      <span class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-default/80 bg-default/50 text-sm font-semibold text-highlighted">
        {{ genre.icon }}
      </span>

      <div class="flex items-center gap-2">
        <span class="vtx-genre-motif">
          {{ resolvedVariant.motif }}
        </span>

        <span
          class="vtx-genre-dot h-2.5 w-2.5 rounded-full"
          :style="{ backgroundColor: genre.accent }"
        />
      </div>
    </div>

    <p class="relative z-10 text-[0.64rem] tracking-[0.24em] text-dimmed uppercase">
      {{ helperText }}
    </p>

    <p class="relative z-10 mt-1 font-display leading-tight text-highlighted" :class="[resolvedVariant.titleClass]">
      {{ genre.name }}
    </p>

    <p class="relative z-10 mt-2 text-sm leading-relaxed text-toned">
      {{ active ? 'Mostrando eventos de este universo' : 'Pulsa para explorar este universo sonoro' }}
    </p>
  </button>
</template>

<style scoped>
.vtx-genre-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 1.15rem;
  box-shadow:
    0 24px 40px -34px rgb(0 0 0 / 0.72),
    inset 0 0 0 1px rgb(255 255 255 / 0.03);
}

.vtx-genre-card--prism {
  min-height: 13.4rem;
  padding: 1.1rem;
  background:
    linear-gradient(170deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.03)),
    linear-gradient(142deg, rgb(12 17 30 / 0.88), rgb(17 25 43 / 0.92));
}

.vtx-genre-card--constellation {
  min-height: 12.2rem;
  padding: 1rem;
  background:
    linear-gradient(170deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.03)),
    linear-gradient(144deg, rgb(10 15 27 / 0.88), rgb(15 22 39 / 0.92));
}

.vtx-genre-card--monolith {
  min-height: 11.7rem;
  padding: 1rem;
  background:
    linear-gradient(168deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.02)),
    linear-gradient(140deg, rgb(11 16 27 / 0.9), rgb(14 21 36 / 0.92));
}

.vtx-genre-motif {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(145 161 190 / 0.46);
  border-radius: 9999px;
  padding: 0.2rem 0.45rem;
  font-size: 0.54rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(198 205 224 / 0.92);
  background: linear-gradient(134deg, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0.03));
}

.vtx-genre-card::before {
  content: '';
  position: absolute;
  inset: -46% 26% 38% -18%;
  pointer-events: none;
  border-radius: 9999px;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--genre-accent) 62%, white 38%) 0%,
    rgb(255 255 255 / 0) 72%
  );
  opacity: 0.42;
  transition:
    transform 300ms ease,
    opacity 300ms ease;
}

.vtx-genre-card::after {
  content: '';
  position: absolute;
  inset: auto -42% -52% 42%;
  height: 12rem;
  border-radius: 9999px;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--genre-accent) 55%, black 45%) 0%,
    rgb(255 255 255 / 0) 72%
  );
  opacity: 0.36;
}

.vtx-genre-card:hover::before,
.vtx-genre-card:focus-visible::before {
  transform: translate3d(0, -8%, 0) scale(1.05);
  opacity: 0.62;
}

.vtx-genre-dot {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--genre-accent) 24%, transparent);
}
</style>
