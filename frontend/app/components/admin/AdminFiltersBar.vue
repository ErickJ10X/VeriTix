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

const emit = defineEmits<{
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

const ALL_OPTION_VALUE = '__all__'

const pageSizeOptions = [
  { label: '12', value: 12 },
  { label: '24', value: 24 },
  { label: '48', value: 48 },
  { label: '96', value: 96 },
]

const quickWindowItems = computed(() => {
  return props.quickWindowOptions.map(option => ({
    value: option.value,
    label: option.label,
  }))
})

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
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Top Row: Search, City, Page Size -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <BaseFormField
        name="search"
        label="Buscar evento"
        class="md:col-span-5"
        :model-value="search"
        icon="i-lucide-search"
        :disabled="loading"
        @update:model-value="$emit('update:search', String($event ?? ''))"
      />

      <BaseFormField
        name="city"
        label="Ciudad"
        class="md:col-span-5"
        :model-value="city"
        icon="i-lucide-map-pin"
        :disabled="loading"
        @update:model-value="$emit('update:city', String($event ?? ''))"
      />

      <UFormField name="pageSize" label="Por página" class="md:col-span-2">
        <USelect
          :model-value="pageSize"
          :items="pageSizeOptions"
          class="w-full"
          :disabled="loading"
          @update:model-value="$emit('update:pageSize', $event)"
        />
      </UFormField>
    </div>

    <!-- Filter Row: Genre, Format, Date Range, Actions -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <UFormField name="genreId" label="Género" class="md:col-span-3">
        <USelect
          :model-value="selectedGenreId"
          :items="genreOptions"
          class="w-full"
          :disabled="loading"
          @update:model-value="selectedGenreId = String($event ?? ALL_OPTION_VALUE)"
        />
      </UFormField>

      <UFormField name="formatId" label="Formato" class="md:col-span-3">
        <USelect
          :model-value="selectedFormatId"
          :items="formatOptions"
          class="w-full"
          :disabled="loading"
          @update:model-value="selectedFormatId = String($event ?? ALL_OPTION_VALUE)"
        />
      </UFormField>

      <BaseFormField
        name="dateFrom"
        label="Desde"
        type="date"
        class="md:col-span-2"
        :model-value="dateFrom"
        :disabled="loading"
        @update:model-value="$emit('update:dateFrom', String($event ?? ''))"
      />

      <BaseFormField
        name="dateTo"
        label="Hasta"
        type="date"
        class="md:col-span-2"
        :model-value="dateTo"
        :disabled="loading"
        @update:model-value="$emit('update:dateTo', String($event ?? ''))"
      />

      <div class="md:col-span-2 flex items-center justify-end gap-2">
        <BaseButton
          kind="tertiary"
          size="sm"
          :disabled="loading"
          @click="$emit('reset')"
        >
          Resetear
        </BaseButton>
        <BaseButton
          kind="primary"
          size="sm"
          :loading="loading"
          @click="$emit('apply')"
        >
          Aplicar
        </BaseButton>
      </div>
    </div>

    <!-- Quick Filters -->
    <div v-if="quickWindowOptions && quickWindowOptions.length > 0" class="flex flex-wrap gap-2 items-center pt-2 border-t border-default">
      <AdminSegmentedControl
        :items="quickWindowItems.map(item => ({ ...item, disabled: loading }))"
        :active-value="quickWindow ?? ''"
        size="xs"
        @select="$emit('update:quickWindow', $event)"
      />
    </div>
  </div>
</template>
