<script setup lang="ts">
import type {
  AdminArtistPayload,
  GenreOption,
} from '~/types'
import { useAdminArtistsRepository } from '~/repositories/adminArtistsRepository'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Nuevo artista | Admin VeriTix' })

const { createArtist: createAdminArtist, listGenres } = useAdminArtistsRepository()
const { getApiErrorMessage } = useApiErrorMessage()

const genres = ref<GenreOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

async function loadGenres() {
  loading.value = true

  try {
    genres.value = await listGenres()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los géneros.')
  }
  finally {
    loading.value = false
  }
}

async function createArtist(payload: AdminArtistPayload) {
  submitting.value = true
  errorMessage.value = ''

  try {
    await createAdminArtist(payload)

    await navigateTo('/admin/artists')
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos crear el artista.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadGenres()
})
</script>

<template>
  <AdminPageShell
    title="Nuevo artista"
    description="Crea un perfil artístico listo para asociar a eventos y catálogos."
    primary-action-to="/admin/artists"
    primary-action-label="Volver a artistas"
  >
    <div class="mx-auto max-w-5xl space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <AdminFormSurface
        eyebrow="Artistas"
        title="Alta de artista"
        description="Define identidad, metadata pública y clasificación por géneros para el equipo de contenido."
        icon="i-lucide-mic-2"
        variant="primary"
        :highlights="['slug único', 'metadatos públicos', 'géneros asociados']"
      >
        <template v-if="loading">
          <div class="space-y-4">
            <USkeleton class="h-11 w-full rounded-lg" />
            <USkeleton class="h-11 w-full rounded-lg" />
            <USkeleton class="h-24 w-full rounded-lg" />
            <USkeleton class="h-11 w-full rounded-lg" />
          </div>
        </template>

        <AdminArtistForm
          v-else
          :genres="genres"
          :submitting="submitting"
          submit-label="Crear artista"
          @submit="createArtist"
        />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
