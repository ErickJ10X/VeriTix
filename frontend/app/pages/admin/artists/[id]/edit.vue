<script setup lang="ts">
import type { AdminArtistPayload, AdminArtistRecord, GenreOption } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Editar artista admin | VeriTix' })

const route = useRoute()
const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const artistId = computed(() => String(route.params.id || ''))
const artist = ref<AdminArtistRecord | null>(null)
const genres = ref<GenreOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function loadPage() {
  loading.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    const [artistResponse, genresResponse] = await Promise.all([
      apiRequest<AdminArtistRecord>(`/admin/artists/${artistId.value}`, {
        method: 'GET',
        headers: requireAdminHeaders(),
      }),
      apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
    ])
    artist.value = artistResponse
    genres.value = genresResponse
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el artista.')
  }
  finally {
    loading.value = false
  }
}

async function updateArtist(payload: AdminArtistPayload) {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    artist.value = await apiRequest<AdminArtistRecord, AdminArtistPayload>(`/admin/artists/${artistId.value}`, {
      method: 'PATCH',
      headers: requireAdminHeaders(),
      body: payload,
    })
    successMessage.value = 'Artista actualizado.'
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos actualizar el artista.')
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
  <AdminPageShell title="Editar artista" description="Mantén actualizado el perfil editorial del artista.">
    <div class="space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-14 rounded-2xl" />
        <USkeleton class="h-36 rounded-2xl" />
      </div>

      <div v-else-if="artist" class="rounded-3xl border border-default/55 bg-default/6 p-6">
        <AdminArtistForm :initial-value="artist" :genres="genres" :submitting="submitting" submit-label="Guardar cambios" @submit="updateArtist" />
      </div>
    </div>
  </AdminPageShell>
</template>
