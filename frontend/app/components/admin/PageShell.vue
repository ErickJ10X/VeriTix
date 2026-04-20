<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description: string
  primaryActionTo?: string
  primaryActionLabel?: string
}>(), {
  primaryActionTo: '',
  primaryActionLabel: '',
})

const route = useRoute()

const navigationItems = [
  { label: 'Dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Eventos', to: '/admin/events', icon: 'i-lucide-calendar-range' },
] as const

const navigationSegments = computed(() => {
  return navigationItems.map(item => ({
    ...item,
    value: item.to,
    testId: `admin-nav-${item.label.toLowerCase()}`,
  }))
})

const activeNavigation = computed(() => {
  return navigationItems.find(item => isActive(item.to))?.to ?? '/admin'
})

function isActive(path: string): boolean {
  if (path === '/admin') {
    return route.path === path
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <section class="py-8 sm:py-10 lg:py-12">
    <UContainer>
      <div class="mx-auto max-w-7xl space-y-8">
        <!-- Header -->
        <header class="space-y-5 border-b border-default/55 pb-7">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-3">
              <UiMetaLabel tone="accent">
                Control center
              </UiMetaLabel>

              <div class="space-y-1.5">
                <h1 class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
                  {{ title }}
                </h1>
                <p class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
                  {{ description }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <slot name="actions" />
              <BaseButton
                v-if="primaryActionTo && primaryActionLabel"
                :to="primaryActionTo"
                kind="primary"
                size="sm"
                leading-icon="i-lucide-plus"
              >
                {{ primaryActionLabel }}
              </BaseButton>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex flex-wrap gap-2" aria-label="Navegación admin">
            <AdminSegmentedControl
              :items="navigationSegments"
              :active-value="activeNavigation"
              size="sm"
            />
          </nav>
        </header>

        <!-- Content -->
        <slot />
      </div>
    </UContainer>
  </section>
</template>
