<script setup lang="ts">
import AdminCard from './AdminCard.vue'

export interface AdminSectionProps {
  title?: string
  description?: string
  eyebrow?: string
  compact?: boolean
}

const props = withDefaults(defineProps<AdminSectionProps>(), {
  title: undefined,
  description: undefined,
  eyebrow: undefined,
  compact: false,
})

const hasHeader = computed(() => !!props.title || !!props.description || !!props.eyebrow)
</script>

<template>
  <AdminCard padding="none">
    <div :class="[compact ? 'p-5' : 'p-6']">
      <div v-if="hasHeader" class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1.5">
          <p v-if="eyebrow" class="text-xs font-semibold tracking-widest uppercase text-dimmed">
            {{ eyebrow }}
          </p>

          <h2
            v-if="title"
            class="font-semibold tracking-tight text-default" :class="[
              compact ? 'text-lg' : 'text-xl',
            ]"
          >
            {{ title }}
          </h2>

          <p v-if="description" class="text-sm text-muted leading-relaxed">
            {{ description }}
          </p>
        </div>

        <div v-if="$slots['header-actions']" class="shrink-0">
          <slot name="header-actions" />
        </div>
      </div>

      <div :class="[hasHeader && 'mt-4']">
        <slot />
      </div>
    </div>
  </AdminCard>
</template>
