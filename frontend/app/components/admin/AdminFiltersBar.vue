<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  search?: string
  city?: string
  artistId?: string
  genreId?: string
  formatId?: string
  dateFrom?: string
  dateTo?: string
  genres?: Array<{ id: string, name: string }>
  formats?: Array<{ id: string, name: string }>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  city: '',
  artistId: '',
  genreId: '',
  formatId: '',
  dateFrom: '',
  dateTo: '',
  genres: () => [],
  formats: () => [],
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:artistId', value: string): void
  (e: 'update:genreId', value: string): void
  (e: 'update:formatId', value: string): void
  (e: 'update:dateFrom', value: string): void
  (e: 'update:dateTo', value: string): void
  (e: 'apply'): void
  (e: 'reset'): void
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
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Row 1: Text search filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <BaseFormField
        name="search"
        label="Buscar evento"
        :model-value="search"
        icon="i-lucide-search"
        :disabled="loading"
        @update:model-value="$emit('update:search', String($event ?? ''))"
      />

      <BaseFormField
        name="city"
        label="Ciudad"
        :model-value="city"
        icon="i-lucide-map-pin"
        :disabled="loading"
        @update:model-value="$emit('update:city', String($event ?? ''))"
      />

      <BaseFormField
        name="artistId"
        label="Artista"
        :model-value="artistId"
        icon="i-lucide-music"
        disabled
        @update:model-value="$emit('update:artistId', String($event ?? ''))"
      />
    </div>

    <!-- Row 2: Dates, dropdowns, actions -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
      <BaseFormField
        name="dateFrom"
        label="Desde"
        type="date"
        :model-value="dateFrom"
        :disabled="loading"
        @update:model-value="$emit('update:dateFrom', String($event ?? ''))"
      />

      <BaseFormField
        name="dateTo"
        label="Hasta"
        type="date"
        :model-value="dateTo"
        :disabled="loading"
        @update:model-value="$emit('update:dateTo', String($event ?? ''))"
      />

      <BaseFormSelect
        name="genreId"
        label="Género"
        :items="genreOptions"
        :model-value="selectedGenreId"
        :disabled="loading"
        @update:model-value="selectedGenreId = String($event ?? ALL_OPTION_VALUE)"
      />

      <BaseFormSelect
        name="formatId"
        label="Formato"
        :items="formatOptions"
        :model-value="selectedFormatId"
        :disabled="loading"
        @update:model-value="selectedFormatId = String($event ?? ALL_OPTION_VALUE)"
      />

      <div class="flex items-end gap-2">
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
  </div>
</template>
