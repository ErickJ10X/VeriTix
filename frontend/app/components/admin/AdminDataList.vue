<script setup lang="ts" generic="T extends Record<string, any>">
interface Props {
  items: T[]
  loading?: boolean
  emptyText?: string
  keyField?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: 'No items found',
  keyField: 'id',
})
</script>

<template>
  <div class="space-y-3">
    <!-- Loading State: Skeleton Loaders -->
    <template v-if="loading">
      <div
        v-for="i in 3"
        :key="`skeleton-${i}`"
        class="flex items-center gap-4 p-4 rounded-lg border border-default bg-default"
      >
        <USkeleton class="h-10 w-10 rounded-full" />
        <div class="space-y-2 flex-1">
          <USkeleton class="h-4 w-1/4" />
          <USkeleton class="h-4 w-1/2" />
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <template v-else-if="!items || items.length === 0">
      <slot name="empty">
        <div class="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-default bg-default text-muted">
          <UIcon name="i-heroicons-inbox" class="w-8 h-8 mb-2 opacity-50" />
          <p class="text-sm font-medium">
            {{ emptyText }}
          </p>
        </div>
      </slot>
    </template>

    <!-- Data List -->
    <template v-else>
      <div
        v-for="(item, index) in items"
        :key="String(item[keyField] || index)"
        class="p-4 rounded-lg border border-default bg-default hover:bg-elevated transition-colors"
      >
        <slot :item="item" :index="index" />
      </div>
    </template>
  </div>
</template>
