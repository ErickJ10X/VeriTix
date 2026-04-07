<script setup lang="ts">
import type { AdminArtistPayload, GenreOption } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Nuevo artista admin | VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const genres = ref<GenreOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

const creationSurface = {
  eyebrow: 'Ficha editorial',
  title: 'Da de alta un artista con presencia',
  description: 'Prepara una entrada sólida para el directorio con identidad, bio, visibilidad y vínculo con géneros relevantes.',
  icon: 'i-lucide-badge-plus',
  highlights: ['Nombre y slug', 'Bio y enlaces', 'Visibilidad', 'Géneros asociados'],
} as const

async function loadPage() {
  loading.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    genres.value = await apiRequest<GenreOption[]>('/genres', { method: 'GET' })
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos preparar el formulario de artista.')
  }
  finally {
    loading.value = false
  }
}

async function createArtist(payload: AdminArtistPayload) {
  submitting.value = true
  errorMessage.value = ''

  try {
    const created = await apiRequest<{ id: string }, AdminArtistPayload>('/admin/artists', {
      method: 'POST',
      headers: requireAdminHeaders(),
      body: payload,
    })
    await navigateTo(`/admin/artists/${created.id}/edit`)
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos crear el artista.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadPage()
})
</script>

<template>
  <AdminPageShell title="Crear artista" description="Alta editorial de artistas y su metadata pública.">
    <div class="space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-14 rounded-2xl" />
        <USkeleton class="h-36 rounded-2xl" />
      </div>

      <AdminFormSurface
        v-else
        :eyebrow="creationSurface.eyebrow"
        :title="creationSurface.title"
        :description="creationSurface.description"
        :icon="creationSurface.icon"
        variant="success"
        :highlights="creationSurface.highlights"
      >
        <AdminArtistForm :genres="genres" :submitting="submitting" submit-label="Crear artista" @submit="createArtist" />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
