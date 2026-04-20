<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  search?: string
  city?: string
  pageSize?: number
  pageSizeOptions?: Array<{ label: string, value: string | number }>
  genreId?: string
  formatId?: string
  dateFrom?: string
  dateTo?: string
  genres?: Array<{ id: string, name: string }>
  formats?: Array<{ id: string, name: string }>
  loading?: boolean
  showCity?: boolean
  showPageSize?: boolean
  showGenre?: boolean
  showFormat?: boolean
  showDateRange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  city: '',
  pageSize: 12,
  pageSizeOptions: () => [],
  genreId: '',
  formatId: '',
  dateFrom: '',
  dateTo: '',
  genres: () => [],
  formats: () => [],
  loading: false,
  showCity: true,
  showPageSize: true,
  showGenre: true,
  showFormat: true,
  showDateRange: true,
})

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:pageSize', value: number): void
  (e: 'update:genreId', value: string): void
  (e: 'update:formatId', value: string): void
  (e: 'update:dateFrom', value: string): void
  (e: 'update:dateTo', value: string): void
}>()

const ALL_OPTION_VALUE = '__all__'

const genreOptions = computed(() => {
  return [
    { label: 'Todos los géneros', value: ALL_OPTION_VALUE },
    ...props.genres.map(g => ({ label: g.name, value: g.id })),
  ]
})

const formatOptions = computed(() => {
  return [
    { label: 'Todos los formatos', value: ALL_OPTION_VALUE },
    ...props.formats.map(f => ({ label: f.name, value: f.id })),
  ]
})

const selectedGenreId = computed({
  get: () => props.genreId || ALL_OPTION_VALUE,
  set: (value: string) => emit('update:genreId', value === ALL_OPTION_VALUE ? '' : value),
})

const selectedFormatId = computed({
  get: () => props.formatId || ALL_OPTION_VALUE,
  set: (value: string) => emit('update:formatId', value === ALL_OPTION_VALUE ? '' : value),
})

const textFiltersGridClass = computed(() => {
  const visibleColumns = 1 + Number(props.showCity) + Number(props.showPageSize)

  if (visibleColumns === 3) {
    return 'md:grid-cols-3'
  }

  if (visibleColumns === 2) {
    return 'md:grid-cols-2'
  }

  return 'md:grid-cols-1'
})

const secondaryFiltersCount = computed(() => {
  const dateColumns = props.showDateRange ? 2 : 0
  return dateColumns + Number(props.showGenre) + Number(props.showFormat)
})

const secondaryFiltersGridClass = computed(() => {
  if (secondaryFiltersCount.value >= 4) {
    return 'md:grid-cols-4'
  }

  if (secondaryFiltersCount.value === 3) {
    return 'md:grid-cols-3'
  }

  if (secondaryFiltersCount.value === 2) {
    return 'md:grid-cols-2'
  }

  return 'md:grid-cols-1'
})
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <!-- Row 1: Text search filters -->
    <div class="grid grid-cols-1 items-end gap-4" :class="textFiltersGridClass">
      <BaseFormField
        name="search"
        label="Buscar evento"
        :model-value="search"
        icon="i-lucide-search"
        :disabled="loading"
        @update:model-value="$emit('update:search', String($event ?? ''))"
      />

      <BaseFormField
        v-if="showCity"
        name="city"
        label="Ciudad"
        :model-value="city"
        icon="i-lucide-map-pin"
        :disabled="loading"
        @update:model-value="$emit('update:city', String($event ?? ''))"
      />

      <BaseFormSelect
        v-if="showPageSize"
        name="pageSize"
        label="Por página"
        size="md"
        :items="pageSizeOptions"
        :model-value="pageSize"
        :disabled="loading"
        @update:model-value="$emit('update:pageSize', Number($event ?? 12))"
      />
    </div>

    <!-- Row 2: Dates and dropdowns -->
    <div
      v-if="secondaryFiltersCount > 0"
      class="grid grid-cols-1 items-end gap-4"
      :class="secondaryFiltersGridClass"
    >
      <BaseFormField
        v-if="showDateRange"
        name="dateFrom"
        label="Desde"
        type="date"
        :model-value="dateFrom"
        :disabled="loading"
        @update:model-value="$emit('update:dateFrom', String($event ?? ''))"
      />

      <BaseFormField
        v-if="showDateRange"
        name="dateTo"
        label="Hasta"
        type="date"
        :model-value="dateTo"
        :disabled="loading"
        @update:model-value="$emit('update:dateTo', String($event ?? ''))"
      />

      <BaseFormSelect
        v-if="showGenre"
        name="genreId"
        label="Género"
        :items="genreOptions"
        :model-value="selectedGenreId"
        :disabled="loading"
        @update:model-value="selectedGenreId = String($event ?? ALL_OPTION_VALUE)"
      />

      <BaseFormSelect
        v-if="showFormat"
        name="formatId"
        label="Formato"
        :items="formatOptions"
        :model-value="selectedFormatId"
        :disabled="loading"
        @update:model-value="selectedFormatId = String($event ?? ALL_OPTION_VALUE)"
      />
    </div>
  </div>
</template>
