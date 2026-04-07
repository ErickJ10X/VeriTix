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
  <section class="py-8 sm:py-10">
    <UContainer>
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <header class="border-b border-default pb-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 class="text-2xl font-semibold">{{ title }}</h1>
              <p class="text-muted mt-1">{{ description }}</p>
            </div>

            <div class="flex items-center gap-3">
              <slot name="actions" />
              <UButton
                v-if="primaryActionTo && primaryActionLabel"
                :to="primaryActionTo"
                color="primary"
              >
                <UIcon name="i-lucide-plus" class="size-4 mr-1" />
                {{ primaryActionLabel }}
              </UButton>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex flex-wrap gap-2 mt-6" aria-label="Navegación admin">
            <NuxtLink
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="isActive(item.to) 
                ? 'bg-default text-default border border-default' 
                : 'text-muted hover:text-default hover:bg-elevated'"
              :data-testid="`admin-nav-${item.label.toLowerCase()}`"
            >
              <UIcon :name="item.icon" class="size-4" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </header>

        <!-- Content -->
        <slot />
      </div>
    </UContainer>
  </section>
</template>
