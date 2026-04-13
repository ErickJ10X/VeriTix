<script setup lang="ts">
interface ToolbarOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  search: string
  status: string
  searchPlaceholder?: string
  statusOptions: readonly ToolbarOption[]
}>(), {
  searchPlaceholder: 'Buscar...',
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
}>()

const segmentedOptions = computed(() => {
  return props.statusOptions.map(option => ({
    value: option.value,
    label: option.label,
  }))
})
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="max-w-md flex-1">
      <BaseFormInput
        :model-value="search"
        :placeholder="searchPlaceholder"
        icon="i-lucide-search"
        size="md"
        class="w-full"
        @update:model-value="emit('update:search', String($event ?? ''))"
      />
    </div>

    <AdminSegmentedControl
      :items="segmentedOptions"
      :active-value="status"
      size="xs"
      @select="emit('update:status', $event)"
    />
  </div>
</template>
