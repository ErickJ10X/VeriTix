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

const editSurface = {
  eyebrow: 'Edición editorial',
  title: 'Modifica los datos del artista',
  description: 'Mantén el perfil actualizado con identidad, bio, visibilidad y vínculo con géneros relevantes.',
  icon: 'i-lucide-badge-check',
  highlights: ['Nombre y slug', 'Bio y enlaces', 'Visibilidad', 'Géneros asociados'],
} as const

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

      <AdminFormSurface
        v-else-if="artist"
        :eyebrow="editSurface.eyebrow"
        :title="editSurface.title"
        :description="editSurface.description"
        :icon="editSurface.icon"
        variant="success"
        :highlights="editSurface.highlights"
      >
        <AdminArtistForm :initial-value="artist" :genres="genres" :submitting="submitting" submit-label="Guardar cambios" @submit="updateArtist" />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
