<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description: string
  primaryActionTo?: string
  primaryActionLabel?: string
}>(), {
  eyebrow: 'Admin',
  primaryActionTo: '',
  primaryActionLabel: '',
})

const route = useRoute()

const navigationItems = [
  { label: 'Dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Eventos', to: '/admin/events', icon: 'i-lucide-calendar-range' },
  { label: 'Usuarios', to: '/admin/users', icon: 'i-lucide-users' },
  { label: 'Artistas', to: '/admin/artists', icon: 'i-lucide-mic-vocal' },
] as const

function isActive(path: string): boolean {
  if (path === '/admin') {
    return route.path === path
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <section class="vtx-admin-shell relative py-10 sm:py-14 lg:py-16">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-primary/12 via-transparent to-transparent" />
      <div class="absolute -left-14 top-24 h-60 w-60 rounded-full bg-primary/12 blur-3xl" />
      <div class="absolute right-0 top-10 h-72 w-72 rounded-full bg-auric-500/12 blur-3xl" />
    </div>

    <UContainer class="relative">
      <div class="mx-auto max-w-7xl space-y-8">
        <header class="space-y-6 border-b border-default/55 pb-8">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="space-y-3">
              <p class="text-[0.68rem] font-semibold tracking-[0.32em] text-secondary uppercase">
                {{ eyebrow }}
              </p>
              <div class="space-y-3">
                <h1 class="font-display text-3xl text-highlighted sm:text-4xl lg:text-[3.1rem]">
                  {{ title }}
                </h1>
                <p class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
                  {{ description }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <slot name="actions" />

              <BasePrimaryButton
                v-if="primaryActionTo && primaryActionLabel"
                :to="primaryActionTo"
                size="lg"
                class="px-5"
              >
                {{ primaryActionLabel }}
              </BasePrimaryButton>
            </div>
          </div>

          <nav class="flex flex-wrap gap-3" aria-label="Navegación admin">
            <NuxtLink
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              class="vtx-admin-nav-link"
              :class="isActive(item.to) && 'vtx-admin-nav-link--active'"
              :data-testid="`admin-nav-${item.label.toLowerCase()}`"
            >
              <UIcon :name="item.icon" class="size-4" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </header>

        <slot />
      </div>
    </UContainer>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-admin-shell {
  isolation: isolate;
}

.vtx-admin-nav-link {
  @apply inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium no-underline transition-all duration-150 focus-visible:outline-none;
  border-color: rgb(145 161 190 / 0.24);
  background: rgb(255 255 255 / 0.04);
  color: rgb(176 186 208 / 0.88);
}

.vtx-admin-nav-link:focus-visible {
  box-shadow:
    0 0 0 2px rgb(239 170 71 / 0.35),
    0 0 0 5px rgb(239 170 71 / 0.08);
}

.vtx-admin-nav-link:hover {
  border-color: rgb(239 170 71 / 0.24);
  background: rgb(255 255 255 / 0.06);
  color: rgb(247 249 255);
}

.vtx-admin-nav-link--active {
  border-color: rgb(239 170 71 / 0.4);
  background: rgb(239 170 71 / 0.14);
  color: rgb(248 194 103);
  box-shadow: 0 16px 28px -24px rgb(239 170 71 / 0.55);
}
</style>
