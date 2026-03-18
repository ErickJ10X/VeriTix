<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    center?: boolean
  }>(),
  {
    eyebrow: '',
    description: '',
    center: false,
  },
)
</script>

<template>
  <div
    class="max-w-3xl space-y-3" :class="[
      center ? 'mx-auto text-center' : 'text-left',
    ]"
  >
    <p
      v-if="eyebrow"
      class="text-xs font-semibold tracking-[0.3em] text-secondary uppercase"
    >
      {{ eyebrow }}
    </p>

    <h2 class="font-display text-4xl leading-tight text-highlighted md:text-5xl">
      {{ title }}
    </h2>

    <p
      v-if="description"
      class="text-sm leading-relaxed text-toned md:text-base"
    >
      {{ description }}
    </p>
  </div>
</template>
