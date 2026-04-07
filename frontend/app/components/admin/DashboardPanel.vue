<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  icon: string
  accentClass?: string
  to: string
  actionLabel: string
}>()
</script>

<template>
  <section class="vtx-admin-dashboard-panel">
    <div class="vtx-admin-dashboard-panel__glow" :class="accentClass" aria-hidden="true" />

    <div class="relative z-10 space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-3">
          <p class="text-[0.68rem] font-semibold tracking-[0.28em] text-dimmed uppercase">
            {{ eyebrow }}
          </p>
          <div class="space-y-2">
            <h2 class="font-display text-2xl text-highlighted">
              {{ title }}
            </h2>
            <p class="max-w-xl text-sm leading-relaxed text-toned">
              {{ description }}
            </p>
          </div>
        </div>

        <div class="vtx-admin-dashboard-panel__icon" :class="accentClass">
          <UIcon :name="icon" class="size-5" />
        </div>
      </div>

      <slot />

      <div class="pt-1">
        <BaseSecondaryButton :to="to" class="justify-center px-5">
          {{ actionLabel }}
        </BaseSecondaryButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-dashboard-panel {
  @apply relative overflow-hidden rounded-[2rem] border p-6 sm:p-7;
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
    0 24px 42px -34px rgb(5 10 20 / 0.92);
}

.vtx-admin-dashboard-panel__glow {
  @apply absolute right-0 top-0 h-36 w-36 rounded-full blur-3xl opacity-80;
  background: var(--vtx-accent-glow);
  transform: translate(32%, -18%);
}

.vtx-admin-dashboard-panel__icon {
  @apply inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border text-base;
  color: var(--vtx-accent-color);
  border-color: color-mix(in srgb, var(--ui-border-accented) 24%, transparent);
  background:
    radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0) 42%),
    linear-gradient(145deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.04));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.08);
}
</style>
