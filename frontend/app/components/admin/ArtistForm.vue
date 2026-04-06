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
      <textarea v-model="state.bio" class="vtx-admin-textarea" rows="5" placeholder="Historia, sonido, referencias..." />
    </UFormField>

    <div class="grid gap-5 lg:grid-cols-3">
      <BaseFormField v-model="state.country" name="country" label="País" />
      <BaseFormField v-model="state.website" name="website" label="Website" type="url" placeholder="https://..." />
      <BaseFormField v-model="state.imageUrl" name="imageUrl" label="Imagen" type="url" placeholder="https://..." />
    </div>

    <label class="vtx-admin-toggle">
      <input v-model="state.isActive" type="checkbox">
      <span>
        <strong>Artista activo</strong>
        <small>Determina si sigue visible para operaciones admin</small>
      </span>
    </label>

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
      <BasePrimaryButton type="submit" size="lg" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </BasePrimaryButton>
    </div>
  </UForm>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-admin-textarea {
  @apply w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-150;
  border-color: rgb(145 161 190 / 0.24);
  background: rgb(255 255 255 / 0.04);
  color: rgb(247 249 255);
}

.vtx-admin-toggle {
  @apply flex items-start gap-3 rounded-2xl border px-4 py-4;
  border-color: rgb(145 161 190 / 0.18);
  background: rgb(255 255 255 / 0.03);
}

.vtx-admin-toggle input {
  margin-top: 0.2rem;
}

.vtx-admin-toggle strong {
  display: block;
  color: rgb(247 249 255);
  font-size: 0.92rem;
}

.vtx-admin-toggle small {
  display: block;
  margin-top: 0.2rem;
  color: rgb(176 186 208 / 0.82);
  font-size: 0.76rem;
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
