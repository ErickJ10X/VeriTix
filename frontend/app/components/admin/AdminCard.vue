<script setup lang="ts">
export interface AdminCardProps {
  variant?: 'default' | 'compact' | 'warning' | 'success' | 'primary'
  hover?: boolean
  padding?: 'default' | 'compact' | 'none'
}

const props = withDefaults(defineProps<AdminCardProps>(), {
  variant: 'default',
  hover: false,
  padding: 'default',
})

const paddingClasses = computed(() => {
  if (props.padding === 'none') { return '' }
  if (props.padding === 'compact') { return 'p-5' }
  return 'p-6'
})

const variantClasses = computed(() => {
  if (props.variant === 'warning') {
    return 'border-amber-200 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5'
  }
  if (props.variant === 'success') {
    return 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5'
  }
  if (props.variant === 'primary') {
    return 'border-blue-200 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5'
  }
  return 'border-default bg-default'
})

const hoverClasses = computed(() => {
  if (!props.hover) { return '' }
  return 'hover:shadow-md hover:-translate-y-0.5 hover:border-default cursor-pointer'
})
</script>

<template>
  <div
    class="rounded-2xl border shadow-sm transition-all duration-200 ease-out" :class="[
      paddingClasses,
      variantClasses,
      hoverClasses,
    ]"
  >
    <slot />
  </div>
</template>
