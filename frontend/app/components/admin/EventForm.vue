<script setup lang="ts">
import type { AdminEventDetail, AdminEventPayload, AdminOption, CurrencyCode, GenreOption, VenueOption } from '~/types'
import { z } from 'zod'

const props = withDefaults(defineProps<{
  initialValue?: Partial<AdminEventDetail>
  venues: VenueOption[]
  genres: GenreOption[]
  formats: AdminOption[]
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar evento',
})

const emit = defineEmits<{
  submit: [payload: AdminEventPayload]
}>()

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  eventDate: z.string().min(1, 'La fecha del evento es obligatoria'),
  maxCapacity: z.number().min(1, 'La capacidad debe ser al menos 1'),
  venueId: z.string().min(1, 'Selecciona un venue'),
  description: z.string().optional(),
  doorsOpenTime: z.string().optional(),
  startSale: z.string().optional(),
  endSale: z.string().optional(),
  imageUrl: z.string().optional(),
  currency: z.enum(['USD', 'EUR', 'COP']),
  formatId: z.string().optional(),
  genreIds: z.array(z.string()).optional(),
})

const state = reactive({
  name: '',
  description: '',
  eventDate: '',
  doorsOpenTime: '',
  startSale: '',
  endSale: '',
  maxCapacity: 100,
  venueId: '',
  imageUrl: '',
  currency: 'EUR' as CurrencyCode,
  formatId: '',
  genreIds: [] as string[],
})

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

function toIsoDateTime(value: string): string | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

function applyInitialValue() {
  state.name = props.initialValue?.name ?? ''
  state.description = props.initialValue?.description ?? ''
  state.eventDate = toDateTimeLocalValue(props.initialValue?.eventDate)
  state.doorsOpenTime = toDateTimeLocalValue(props.initialValue?.doorsOpenTime)
  state.startSale = toDateTimeLocalValue(props.initialValue?.startSale)
  state.endSale = toDateTimeLocalValue(props.initialValue?.endSale)
  state.maxCapacity = props.initialValue?.maxCapacity ?? 100
  state.venueId = props.initialValue?.venue?.id ?? ''
  state.imageUrl = props.initialValue?.imageUrl ?? ''
  state.currency = props.initialValue?.currency ?? 'EUR'
  state.formatId = props.initialValue?.format?.id ?? ''
  state.genreIds = props.initialValue?.genres?.map(genre => genre.id) ?? []
}

function toggleGenre(genreId: string) {
  if (state.genreIds.includes(genreId)) {
    state.genreIds = state.genreIds.filter(id => id !== genreId)
    return
  }

  state.genreIds = [...state.genreIds, genreId]
}

function handleSubmit() {
  emit('submit', {
    name: state.name.trim(),
    description: state.description.trim() || undefined,
    eventDate: toIsoDateTime(state.eventDate) ?? '',
    doorsOpenTime: toIsoDateTime(state.doorsOpenTime),
    startSale: toIsoDateTime(state.startSale),
    endSale: toIsoDateTime(state.endSale),
    maxCapacity: Number(state.maxCapacity),
    venueId: state.venueId,
    imageUrl: state.imageUrl.trim() || undefined,
    currency: state.currency,
    formatId: state.formatId || undefined,
    genreIds: state.genreIds.length > 0 ? state.genreIds : undefined,
  })
}

watch(() => props.initialValue, applyInitialValue, { immediate: true })
</script>

<template>
  <UForm :state="state" :schema="schema" :validate-on="[]" class="space-y-8" @submit="handleSubmit">
    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.name" name="name" label="Nombre" placeholder="VeriTix Sunset Series" required />
      <BaseFormField v-model="state.eventDate" name="eventDate" label="Fecha del evento" type="datetime-local" required />
    </div>

    <UFormField name="description" label="Descripción">
      <textarea v-model="state.description" class="vtx-admin-textarea" rows="5" placeholder="Describe la propuesta del evento" />
    </UFormField>

    <div class="grid gap-5 lg:grid-cols-3">
      <BaseFormField v-model="state.doorsOpenTime" name="doorsOpenTime" label="Apertura de puertas" type="datetime-local" />
      <BaseFormField v-model="state.startSale" name="startSale" label="Inicio de venta" type="datetime-local" />
      <BaseFormField v-model="state.endSale" name="endSale" label="Fin de venta" type="datetime-local" />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.maxCapacity" name="maxCapacity" label="Capacidad máxima" type="number" required />
      <BaseFormField v-model="state.imageUrl" name="imageUrl" label="Imagen" type="url" placeholder="https://..." />
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <UFormField name="currency" label="Moneda" required>
        <select v-model="state.currency" class="vtx-admin-select">
          <option value="EUR">
            EUR
          </option>
          <option value="USD">
            USD
          </option>
          <option value="COP">
            COP
          </option>
        </select>
      </UFormField>

      <UFormField name="venueId" label="Venue" required>
        <select v-model="state.venueId" class="vtx-admin-select">
          <option value="">
            Selecciona un venue
          </option>
          <option v-for="venue in venues" :key="venue.id" :value="venue.id">
            {{ venue.name }} · {{ venue.city }}
          </option>
        </select>
      </UFormField>

      <UFormField name="formatId" label="Formato">
        <select v-model="state.formatId" class="vtx-admin-select">
          <option value="">
            Sin formato específico
          </option>
          <option v-for="format in formats" :key="format.id" :value="format.id">
            {{ format.name }}
          </option>
        </select>
      </UFormField>
    </div>

    <UFormField name="genreIds" label="Géneros">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="genre in genres"
          :key="genre.id"
          type="button"
          class="vtx-admin-chip"
          :class="state.genreIds.includes(genre.id) && 'vtx-admin-chip--active'"
          @click="toggleGenre(genre.id)"
        >
          {{ genre.name }}
        </button>
      </div>
    </UFormField>

    <div class="flex justify-end">
      <BasePrimaryButton type="submit" size="lg" :loading="submitting" :disabled="submitting" data-testid="event-form-submit">
        {{ submitLabel }}
      </BasePrimaryButton>
    </div>
  </UForm>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-textarea,
.vtx-admin-select {
  @apply w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-150;
  border-color: rgb(145 161 190 / 0.24);
  background: rgb(255 255 255 / 0.04);
  color: rgb(247 249 255);
}

.vtx-admin-textarea:focus,
.vtx-admin-select:focus {
  border-color: rgb(239 170 71 / 0.38);
  box-shadow: 0 0 0 3px rgb(239 170 71 / 0.08);
}

.vtx-admin-chip {
  @apply inline-flex items-center rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-150;
  border-color: rgb(145 161 190 / 0.22);
  background: rgb(255 255 255 / 0.03);
  color: rgb(176 186 208 / 0.88);
}

.vtx-admin-chip--active {
  border-color: rgb(239 170 71 / 0.42);
  background: rgb(239 170 71 / 0.14);
  color: rgb(248 194 103);
}
</style>
