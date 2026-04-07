<script setup lang="ts">
export interface AdminMetricProps {
  label: string
  value: string | number
  hint?: string
  icon: string
  variant?: 'default' | 'warning' | 'success' | 'primary' | 'error'
}

const props = withDefaults(defineProps<AdminMetricProps>(), {
  variant: 'default',
  hint: '',
})

const iconContainerClasses = computed(() => {
  const base = 'p-2.5 rounded-lg border transition-colors'

  if (props.variant === 'warning') {
    return `${base} bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20`
  }
  if (props.variant === 'success') {
    return `${base} bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20`
  }
  if (props.variant === 'primary') {
    return `${base} bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20`
  }
  if (props.variant === 'error') {
    return `${base} bg-rose-50/50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20`
  }

  return `${base} bg-default border-default`
})

const iconClasses = computed(() => {
  if (props.variant === 'warning') { return 'text-amber-600 dark:text-amber-400' }
  if (props.variant === 'success') { return 'text-emerald-600 dark:text-emerald-400' }
  if (props.variant === 'primary') { return 'text-blue-600 dark:text-blue-400' }
  if (props.variant === 'error') { return 'text-rose-600 dark:text-rose-400' }

  return 'text-muted'
})
</script>

<template>
  <AdminCard :variant="variant === 'default' ? 'default' : variant" hover>
    <div class="flex items-start gap-3 mb-4">
      <div :class="iconContainerClasses">
        <UIcon :name="icon" class="size-5" :class="[iconClasses]" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-muted tracking-tight">
          {{ label }}
        </p>
      </div>
    </div>

    <div class="space-y-1">
      <p class="text-3xl font-semibold tracking-tight text-default">
        {{ value }}
      </p>
      <p v-if="hint" class="text-xs text-muted font-medium">
        {{ hint }}
      </p>
    </div>
  </AdminCard>
</template>
