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

<style scoped>
@reference "tailwindcss";

.vtx-profile-metric {
  @apply relative overflow-hidden rounded-2xl px-4 py-4;
  border: 1px solid rgb(145 161 190 / 0.18);
  background:
    linear-gradient(145deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.01)),
    linear-gradient(120deg, rgb(11 17 31 / 0.46), rgb(16 23 40 / 0.26));
}

.vtx-profile-metric::before {
  @apply absolute inset-x-4 top-0 h-px;
  content: '';
  background: linear-gradient(
    90deg,
    rgb(239 170 71 / 0),
    rgb(239 170 71 / 0.65),
    rgb(44 189 230 / 0.65),
    rgb(239 170 71 / 0)
  );
}
</style>
