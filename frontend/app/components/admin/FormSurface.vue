<script setup lang="ts">
const props = defineProps<{
  eyebrow: string
  title: string
  description: string
  icon: string
  accentClass: string
  highlights: readonly string[]
}>()

const trimmedHighlights = computed(() => props.highlights.slice(0, 4))
</script>

<template>
  <section class="vtx-admin-surface">
    <div class="vtx-admin-surface__glow" :class="accentClass" aria-hidden="true" />

    <div class="relative z-10 space-y-6">
      <div class="flex flex-col gap-5 border-b border-default/60 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-3xl space-y-3">
          <p class="text-[0.68rem] font-semibold tracking-[0.28em] text-dimmed uppercase">
            {{ eyebrow }}
          </p>
          <div class="space-y-3">
            <h2 class="font-display text-3xl tracking-[0.02em] text-highlighted sm:text-[2.35rem]">
              {{ title }}
            </h2>
            <p class="max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
              {{ description }}
            </p>
          </div>
        </div>

        <div class="vtx-admin-surface__icon" :class="accentClass">
          <UIcon :name="icon" class="size-6" />
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="highlight in trimmedHighlights"
          :key="highlight"
          class="vtx-admin-surface__pill"
        >
          {{ highlight }}
        </div>
      </div>

      <div class="vtx-admin-surface__form">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-surface {
  @apply relative overflow-hidden rounded-[2rem] border p-6 sm:p-7 lg:p-8;
  border-color: color-mix(in srgb, var(--ui-border-accented) 26%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.015)),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--ui-bg) 90%, black),
      color-mix(in srgb, var(--ui-bg-elevated) 84%, black)
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.06),
    0 28px 54px -38px rgb(7 12 24 / 0.9);
}

.vtx-admin-surface::before {
  @apply absolute inset-x-6 top-0 h-px;
  content: '';
  background: linear-gradient(
    90deg,
    rgb(255 255 255 / 0),
    color-mix(in srgb, var(--color-auric-300) 70%, white),
    rgb(255 255 255 / 0)
  );
}

.vtx-admin-surface__glow {
  @apply pointer-events-none absolute -right-8 top-0 h-44 w-44 rounded-full blur-3xl opacity-85;
  background: var(--vtx-accent-glow);
}

.vtx-admin-surface__icon {
  @apply inline-flex size-16 shrink-0 items-center justify-center rounded-[1.45rem] border text-lg;
  color: var(--vtx-accent-color);
  border-color: color-mix(in srgb, var(--ui-border-accented) 22%, transparent);
  background:
    radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.18), rgb(255 255 255 / 0) 42%),
    linear-gradient(145deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.04));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.08);
}

.vtx-admin-surface__pill {
  @apply rounded-2xl border px-3 py-3 text-center text-[0.72rem] font-semibold tracking-[0.16em] uppercase;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background: color-mix(in srgb, var(--ui-bg-accented) 36%, transparent);
  color: var(--ui-text-highlighted);
}

.vtx-admin-surface__form {
  @apply rounded-[1.75rem] border p-5 sm:p-6 lg:p-7;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.01)),
    color-mix(in srgb, var(--ui-bg) 76%, transparent);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
}

</style>
