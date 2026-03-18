<script setup lang="ts">
import type { Genre } from '~/types'

defineProps<{
  genre: Genre
  active?: boolean
}>()

const emit = defineEmits<{
  select: [slug: string]
}>()
</script>

<template>
  <button
    class="w-full rounded-2xl border border-default bg-elevated/70 p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-accented"
    :class="active ? 'border-primary/60 ring-2 ring-primary/30 bg-accented/30' : ''"
    type="button"
    @click="emit('select', genre.slug)"
  >
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs tracking-[0.18em] text-muted uppercase">
        {{ genre.icon }}
      </span>

      <span
        class="h-2.5 w-2.5 rounded-full"
        :style="{ backgroundColor: genre.accent }"
      />
    </div>

    <p class="font-display text-2xl text-highlighted">
      {{ genre.name }}
    </p>
  </button>
</template>
