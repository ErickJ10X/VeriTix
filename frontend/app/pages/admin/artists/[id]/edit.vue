<script setup lang="ts">
import type {
  AdminArtistPayload,
  AdminArtistRecord,
  GenreOption,
} from '~/types'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Editar artista | Admin VeriTix' })

const route = useRoute()
const artistId = computed(() => String(route.params.id || ''))

const apiRequest = useApiRequest()
const { requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()

const artist = ref<AdminArtistRecord | null>(null)
const genres = ref<GenreOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function loadGenres() {
  try {
    genres.value = await apiRequest<GenreOption[]>('/genres', { method: 'GET' })
  }
  catch {
    genres.value = []
  }
}

async function loadArtist() {
  loading.value = true
  errorMessage.value = ''

  try {
    artist.value = await apiRequest<AdminArtistRecord>(`/artists/${artistId.value}`, {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Artista no encontrado.',
      })
    }

    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el artista.')
  }
  finally {
    loading.value = false
  }
}

async function updateArtist(payload: AdminArtistPayload) {
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    artist.value = await apiRequest<AdminArtistRecord, AdminArtistPayload>(`/artists/${artistId.value}`, {
      method: 'PATCH',
      headers: requireAdminHeaders(),
      body: payload,
    })

    successMessage.value = 'Artista actualizado correctamente.'
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos actualizar el artista.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void Promise.all([loadGenres(), loadArtist()])
})
</script>

<template>
  <AdminPageShell
    title="Editar artista"
    description="Ajusta identidad, metadata y clasificación del artista seleccionado."
    primary-action-to="/admin/artists"
    primary-action-label="Volver a artistas"
  >
    <div class="mx-auto max-w-5xl space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <AdminFormSurface
        eyebrow="Artistas"
        title="Ficha de artista"
        description="Refina datos públicos y asociaciones para mantener coherencia editorial en el catálogo."
        icon="i-lucide-pen-square"
        variant="warning"
        :highlights="['perfil público', 'slug', 'géneros']"
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
          v-else-if="artist"
          :initial-value="artist"
          :genres="genres"
          :submitting="submitting"
          submit-label="Guardar cambios"
          @submit="updateArtist"
        />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
