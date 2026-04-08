<script setup lang="ts">
defineProps<{
  metrics: Array<{
    label: string
    value: string
    tone: string
  }>
}>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <article
      v-for="metric in metrics"
      :key="metric.label"
      class="vtx-profile-metric"
    >
      <p class="text-[0.68rem] font-semibold tracking-[0.22em] text-dimmed uppercase">
        {{ metric.label }}
      </p>
      <p class="mt-3 text-base font-semibold" :class="metric.tone">
        {{ metric.value }}
      </p>
    </article>
  </div>
</template>
