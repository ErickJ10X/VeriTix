<script setup lang="ts">
interface SegmentedControlItem {
  value: string
  label: string
  icon?: string
  to?: string
  disabled?: boolean
  testId?: string
}

withDefaults(defineProps<{
  items: SegmentedControlItem[]
  activeValue: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  size: 'sm',
})

const emit = defineEmits<{
  select: [value: string]
}>()

function handleSelect(item: SegmentedControlItem) {
  if (item.disabled || item.to) {
    return
  }

  emit('select', item.value)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5 rounded-2xl border border-default/70 bg-elevated/80 p-1">
    <BaseButton
      v-for="item in items"
      :key="item.value"
      :to="item.to"
      :kind="activeValue === item.value ? 'secondary' : 'tertiary'"
      :size="size"
      :leading-icon="item.icon"
      :disabled="item.disabled"
      :data-testid="item.testId || undefined"
      class="min-w-0 border-transparent shadow-none"
      :class="activeValue === item.value
        ? 'bg-secondary/12 text-highlighted hover:border-secondary/30 hover:bg-secondary/16'
        : 'text-toned hover:bg-default/70 hover:text-highlighted'"
      @click="handleSelect(item)"
    >
      {{ item.label }}
    </BaseButton>
  </div>
</template>
