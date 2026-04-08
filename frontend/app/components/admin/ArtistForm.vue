<script setup lang="ts">
import type { AdminArtistPayload, AdminArtistRecord, GenreOption } from '~/types'
import { z } from 'zod'

const props = withDefaults(defineProps<{
  initialValue?: Partial<AdminArtistRecord>
  genres: GenreOption[]
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar artista',
})

const emit = defineEmits<{
  submit: [payload: AdminArtistPayload]
}>()

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1, 'El slug es obligatorio'),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  isActive: z.boolean(),
  genreIds: z.array(z.string()).optional(),
})

const state = reactive({
  name: '',
  slug: '',
  bio: '',
  imageUrl: '',
  country: '',
  website: '',
  isActive: true,
  genreIds: [] as string[],
})

const genreOptions = computed(() => {
  return props.genres.map(genre => ({ label: genre.name, value: genre.id }))
})

function applyInitialValue() {
  state.name = props.initialValue?.name ?? ''
  state.slug = props.initialValue?.slug ?? ''
  state.bio = props.initialValue?.bio ?? ''
  state.imageUrl = props.initialValue?.imageUrl ?? ''
  state.country = props.initialValue?.country ?? ''
  state.website = props.initialValue?.website ?? ''
  state.isActive = props.initialValue?.isActive ?? true
  state.genreIds = props.initialValue?.genres?.map(genre => genre.id) ?? []
}

function handleSubmit() {
  emit('submit', {
    name: state.name.trim(),
    slug: state.slug.trim(),
    bio: state.bio.trim() || undefined,
    imageUrl: state.imageUrl.trim() || undefined,
    country: state.country.trim() || undefined,
    website: state.website.trim() || undefined,
    isActive: state.isActive,
    genreIds: state.genreIds.length > 0 ? state.genreIds : undefined,
  })
}

watch(() => props.initialValue, applyInitialValue, { immediate: true })
</script>

<template>
  <UForm :state="state" :schema="schema" :validate-on="[]" class="space-y-8" @submit="handleSubmit">
    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.name" name="name" label="Nombre" required />
      <BaseFormField v-model="state.slug" name="slug" label="Slug" placeholder="artist-name" required />
    </div>

    <UFormField name="bio" label="Bio">
      <UTextarea v-model="state.bio" :rows="5" placeholder="Historia, sonido, referencias..." />
    </UFormField>

    <div class="grid gap-5 lg:grid-cols-3">
      <BaseFormField v-model="state.country" name="country" label="País" />
      <BaseFormField v-model="state.website" name="website" label="Website" type="url" placeholder="https://..." />
      <BaseFormField v-model="state.imageUrl" name="imageUrl" label="Imagen" type="url" placeholder="https://..." />
    </div>

    <UCheckbox
      v-model="state.isActive"
      label="Artista activo"
      description="Determina si sigue visible para operaciones admin"
      variant="card"
    />

    <UFormField name="genreIds" label="Géneros">
      <USelect
        v-model="state.genreIds"
        :items="genreOptions"
        multiple
        placeholder="Selecciona géneros"
      />
    </UFormField>

    <div class="flex justify-end">
      <BasePrimaryButton type="submit" size="lg" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </BasePrimaryButton>
    </div>
  </UForm>
</template>
