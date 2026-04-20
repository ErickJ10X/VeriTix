<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  title: string
  description: string
  icon?: string
  actionLabel?: string
  actionTo?: string
  accent?: 'auric' | 'nebula' | 'ember' | 'electric' | 'crimson' | 'verdant' | 'slate'
}>(), {
  accent: 'slate',
})

defineEmits(['action'])

const accentClasses = computed(() => {
  const map: Record<string, string> = {
    auric: 'bg-auric-500/10 text-auric-500',
    nebula: 'bg-nebula-500/10 text-nebula-500',
    ember: 'bg-ember-500/10 text-ember-500',
    electric: 'bg-electric-500/10 text-electric-500',
    crimson: 'bg-crimson-500/10 text-crimson-500',
    verdant: 'bg-verdant-500/10 text-verdant-500',
    slate: 'bg-slate-500/10 text-slate-500',
  }
  return map[props.accent] || map.slate
})
</script>

<template>
  <header class="pb-6 mb-6 border-b border-default flex items-start justify-between gap-4">
    <div class="flex items-start gap-4">
      <div
        v-if="icon"
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" :class="[accentClasses]"
      >
        <UIcon :name="icon" class="h-6 w-6" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold text-default">
          {{ title }}
        </h1>
        <p class="mt-1 text-muted">
          {{ description }}
        </p>
      </div>
    </div>

    <div v-if="actionLabel" class="shrink-0">
      <BaseButton
        :to="actionTo"
        kind="primary"
        size="sm"
        @click="!actionTo && $emit('action')"
      >
        {{ actionLabel }}
      </BaseButton>
    </div>
  </header>
</template>
