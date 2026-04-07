<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint: string
  icon: string
  accentClass?: string
}>()
</script>

<template>
  <article class="vtx-admin-metric-card">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-3">
        <p class="text-[0.68rem] font-semibold tracking-[0.26em] text-dimmed uppercase">
          {{ label }}
        </p>
        <p class="font-display text-3xl text-highlighted sm:text-[2.4rem]">
          {{ value }}
        </p>
      </div>

      <div class="vtx-admin-metric-card__icon" :class="accentClass">
        <UIcon :name="icon" class="size-5" />
      </div>
    </div>

    <p class="max-w-xs text-sm leading-relaxed text-toned">
      {{ hint }}
    </p>
  </article>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-metric-card {
  @apply flex h-full flex-col justify-between gap-6 rounded-[1.8rem] border p-5 sm:p-6;
  border-color: color-mix(in srgb, var(--ui-border-accented) 22%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.015)),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-bg) 88%, black),
      color-mix(in srgb, var(--ui-bg-elevated) 82%, black)
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    0 22px 40px -34px rgb(5 10 20 / 0.9);
}

.vtx-admin-metric-card__icon {
  @apply inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border text-base;
  color: var(--vtx-accent-color);
  border-color: color-mix(in srgb, var(--ui-border-accented) 24%, transparent);
  background:
    radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0) 42%),
    linear-gradient(145deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.04)),
    var(--vtx-accent-glow);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.08);
}
</style>
