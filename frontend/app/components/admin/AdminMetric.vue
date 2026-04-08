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
      return `${base} bg-warning/10 border-warning/20`
    }
    if (props.variant === 'success') {
      return `${base} bg-success/10 border-success/20`
    }
    if (props.variant === 'primary') {
      return `${base} bg-primary/10 border-primary/20`
    }
    if (props.variant === 'error') {
      return `${base} bg-error/10 border-error/20`
    }

    return `${base} bg-default border-default`
  })

  const iconClasses = computed(() => {
    if (props.variant === 'warning') { return 'text-warning' }
    if (props.variant === 'success') { return 'text-success' }
    if (props.variant === 'primary') { return 'text-primary' }
    if (props.variant === 'error') { return 'text-error' }

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
