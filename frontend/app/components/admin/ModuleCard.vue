<script setup lang="ts">
const props = defineProps<{
  eyebrow: string
  title: string
  description: string
  icon: string
  to: string
  createTo: string
  createLabel: string
  accentClass: string
  highlights: readonly string[]
  featured?: boolean
}>()

const trimmedHighlights = computed(() => props.highlights.slice(0, 3))
</script>

<template>
  <article class="vtx-admin-module-card group" :class="featured && 'vtx-admin-module-card--featured'">
    <div class="vtx-admin-module-card__glow" :class="accentClass" aria-hidden="true" />

    <div class="relative z-10 flex h-full flex-col gap-6">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-3">
          <p class="text-[0.68rem] font-semibold tracking-[0.3em] text-dimmed uppercase">
            {{ eyebrow }}
          </p>

          <div class="space-y-2">
            <h2 class="font-display text-2xl tracking-[0.02em] text-highlighted sm:text-[1.85rem]">
              {{ title }}
            </h2>
            <p class="max-w-md text-sm leading-relaxed text-toned sm:text-[0.95rem]">
              {{ description }}
            </p>
          </div>
        </div>

        <div class="vtx-admin-module-card__icon" :class="accentClass">
          <UIcon :name="icon" class="size-5" />
        </div>
      </div>

      <div class="grid gap-2 sm:grid-cols-3" :class="featured && 'xl:max-w-2xl'">
        <div
          v-for="highlight in trimmedHighlights"
          :key="highlight"
          class="vtx-admin-module-card__pill"
        >
          {{ highlight }}
        </div>
      </div>

      <div class="vtx-admin-module-card__rail">
        <div>
          <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-dimmed uppercase">
            Acceso rápido
          </p>
          <p class="mt-2 text-sm text-toned">
            Entra al módulo o crea un registro nuevo sin dar rodeos.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BaseSecondaryButton :to="to" class="justify-center px-5">
            Abrir módulo
          </BaseSecondaryButton>

          <BasePrimaryButton :to="createTo" class="justify-center px-5">
            {{ createLabel }}
          </BasePrimaryButton>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-module-card {
  @apply relative overflow-hidden rounded-[2rem] border p-6 sm:p-7;
  border-color: color-mix(in srgb, var(--ui-border-accented) 24%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.015)),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--ui-bg) 88%, black),
      color-mix(in srgb, var(--ui-bg-elevated) 82%, black)
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.06),
    0 24px 44px -34px rgb(5 10 20 / 0.9);
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease,
    background 220ms ease;
}

.vtx-admin-module-card::before {
  @apply absolute inset-x-6 top-0 h-px;
  content: '';
  background: linear-gradient(
    90deg,
    rgb(255 255 255 / 0),
    color-mix(in srgb, var(--color-auric-300) 72%, white),
    rgb(255 255 255 / 0)
  );
}

.vtx-admin-module-card::after {
  @apply absolute inset-0 opacity-0;
  content: '';
  background:
    radial-gradient(circle at top right, rgb(255 255 255 / 0.14), rgb(255 255 255 / 0) 34%),
    linear-gradient(135deg, rgb(255 255 255 / 0.03), rgb(255 255 255 / 0));
  transition: opacity 220ms ease;
}

.vtx-admin-module-card:hover,
.vtx-admin-module-card:focus-within {
  border-color: color-mix(in srgb, var(--color-auric-400) 34%, transparent);
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 34px 60px -38px rgb(12 22 39 / 0.95),
    0 22px 40px -34px color-mix(in srgb, var(--color-auric-400) 42%, transparent);
}

.vtx-admin-module-card:hover::after,
.vtx-admin-module-card:focus-within::after {
  opacity: 1;
}

.vtx-admin-module-card__glow {
  @apply absolute right-0 top-0 h-36 w-36 rounded-full blur-3xl opacity-80;
  background: var(--vtx-accent-glow);
  transform: translate(30%, -22%);
}

.vtx-admin-module-card__icon {
  @apply inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border text-base;
  color: var(--vtx-accent-color);
  border-color: color-mix(in srgb, var(--ui-border-accented) 24%, transparent);
  background:
    radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0) 42%),
    linear-gradient(145deg, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0.04));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.08);
}

.vtx-admin-module-card__pill {
  @apply rounded-2xl border px-3 py-2 text-center text-[0.72rem] font-semibold tracking-[0.16em] uppercase;
  border-color: color-mix(in srgb, var(--ui-border-accented) 22%, transparent);
  background: color-mix(in srgb, var(--ui-bg-accented) 30%, transparent);
  color: var(--ui-text-highlighted);
}

.vtx-admin-module-card__rail {
  @apply mt-auto flex flex-col gap-4 rounded-[1.65rem] border p-4 sm:p-5;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg) 72%, transparent);
}

.vtx-admin-module-card--featured {
  min-height: 100%;
}

@media (min-width: 1280px) {
  .vtx-admin-module-card--featured .vtx-admin-module-card__rail {
    @apply flex-row items-center justify-between gap-6;
  }
}

</style>
