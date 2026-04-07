<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  search?: string
  city?: string
  genreId?: string
  formatId?: string
  dateFrom?: string
  dateTo?: string
  genres?: Array<{ id: string, name: string }>
  formats?: Array<{ id: string, name: string }>
  pageSize?: number
  loading?: boolean
  quickWindow?: string | null
  quickWindowOptions?: Array<{ value: string, label: string }>
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  city: '',
  genreId: '',
  formatId: '',
  dateFrom: '',
  dateTo: '',
  genres: () => [],
  formats: () => [],
  pageSize: 24,
  loading: false,
  quickWindow: null,
  quickWindowOptions: () => [],
})

defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:genreId', value: string): void
  (e: 'update:formatId', value: string): void
  (e: 'update:dateFrom', value: string): void
  (e: 'update:dateTo', value: string): void
  (e: 'update:pageSize', value: number): void
  (e: 'update:quickWindow', value: string): void
  (e: 'apply'): void
  (e: 'reset'): void
}>()

const pageSizeOptions = [
  { label: '12', value: 12 },
  { label: '24', value: 24 },
  { label: '48', value: 48 },
  { label: '96', value: 96 },
]

const genreOptions = computed(() => {
  return [
    { label: 'All Genres', value: '' },
    ...props.genres.map(g => ({ label: g.name, value: g.id })),
  ]
})

const formatOptions = computed(() => {
  return [
    { label: 'All Formats', value: '' },
    ...props.formats.map(f => ({ label: f.name, value: f.id })),
  ]
})
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Top Row: Search, City, Page Size -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <UFormField label="Search Events" class="md:col-span-5">
        <UInput
          :model-value="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search by event name..."
          class="w-full"
          :disabled="loading"
          @update:model-value="$emit('update:search', $event)"
        />
      </UFormField>

      <UFormField label="City" class="md:col-span-5">
        <UInput
          :model-value="city"
          icon="i-heroicons-map-pin"
          placeholder="Filter by city..."
          class="w-full"
          :disabled="loading"
          @update:model-value="$emit('update:city', $event)"
        />
      </UFormField>

      <UFormField label="Per Page" class="md:col-span-2">
        <USelect
          :model-value="pageSize"
          :options="pageSizeOptions"
          class="w-full"
          :disabled="loading"
          @update:model-value="$emit('update:pageSize', Number($event))"
        />
      </UFormField>
    </div>

    <!-- Filter Row: Genre, Format, Date Range, Actions -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <UFormField label="Genre" class="md:col-span-3">
        <USelect
          :model-value="genreId"
          :options="genreOptions"
          class="w-full"
          :disabled="loading"
          @update:model-value="$emit('update:genreId', $event)"
        />
      </UFormField>

      <UFormField label="Format" class="md:col-span-3">
        <USelect
          :model-value="formatId"
          :options="formatOptions"
          class="w-full"
          :disabled="loading"
          @update:model-value="$emit('update:formatId', $event)"
        />
      </UFormField>

      <UFormField label="Date From" class="md:col-span-2">
        <UInput
          type="date"
          :model-value="dateFrom"
          class="w-full"
          :disabled="loading"
          @update:model-value="$emit('update:dateFrom', $event)"
        />
      </UFormField>

      <UFormField label="Date To" class="md:col-span-2">
        <UInput
          type="date"
          :model-value="dateTo"
          class="w-full"
          :disabled="loading"
          @update:model-value="$emit('update:dateTo', $event)"
        />
      </UFormField>

      <div class="md:col-span-2 flex items-center justify-end gap-2 h-8">
        <UButton
          color="gray"
          variant="ghost"
          label="Reset"
          :disabled="loading"
          @click="$emit('reset')"
        />
        <UButton
          color="black"
          label="Apply"
          :loading="loading"
          @click="$emit('apply')"
        />
      </div>
    </div>

    <!-- Quick Filters -->
    <div v-if="quickWindowOptions && quickWindowOptions.length > 0" class="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-200 dark:border-gray-800">
      <span class="text-sm text-gray-500 dark:text-gray-400 font-medium mr-2">Quick dates:</span>
      <UButton
        v-for="option in quickWindowOptions"
        :key="option.value"
        :color="quickWindow === option.value ? 'primary' : 'gray'"
        :variant="quickWindow === option.value ? 'soft' : 'ghost'"
        size="xs"
        class="rounded-full"
        :label="option.label"
        :disabled="loading"
        @click="$emit('update:quickWindow', option.value)"
      />
    </div>
  </div>
</template>
