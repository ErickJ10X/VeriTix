<script setup lang="ts">
import type { AdminArtistRecord, PaginatedResponse } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Admin artistas | VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const artists = ref<AdminArtistRecord[]>([])
const pending = ref(true)
const errorMessage = ref('')
const deletingArtistId = ref('')

async function loadArtists() {
  pending.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    const response = await apiRequest<PaginatedResponse<AdminArtistRecord>>('/admin/artists', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: { page: 1, limit: 50 },
    })
    artists.value = response.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los artistas.')
  }
  finally {
    pending.value = false
  }
}

async function removeArtist(artistId: string) {
  deletingArtistId.value = artistId
  try {
    await apiRequest(`/admin/artists/${artistId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })
    await loadArtists()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el artista.')
  }
  finally {
    deletingArtistId.value = ''
  }
}

onMounted(() => {
  void loadArtists()
})
</script>

<template>
  <AdminPageShell
    title="Artistas admin"
    description="Directorio para crear, editar y retirar artistas del ecosistema."
    primary-action-to="/admin/artists/new"
    primary-action-label="Crear artista"
  >
    <div class="space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
        <USkeleton v-for="index in 4" :key="index" class="h-44 rounded-3xl" />
      </div>

      <div v-else-if="artists.length === 0" class="vtx-admin-empty">
        No hay artistas disponibles todavía.
      </div>

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <article v-for="artist in artists" :key="artist.id" class="vtx-admin-list-card">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="soft">
                {{ artist.isActive ? 'Activo' : 'Inactivo' }}
              </UBadge>
              <span class="text-xs text-dimmed">{{ artist.slug }}</span>
            </div>
            <h2 class="text-lg font-semibold text-highlighted">
              {{ artist.name }}
            </h2>
            <p class="text-sm text-toned">
              {{ artist.country || 'País pendiente' }}
            </p>
            <p class="text-sm text-dimmed">
              {{ artist.genres.map(genre => genre.name).join(', ') || 'Sin géneros' }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <BaseSecondaryButton :to="`/admin/artists/${artist.id}/edit`" size="sm">
              Editar
            </BaseSecondaryButton>
            <AdminDeleteAction
              :item-label="artist.name"
              :pending="deletingArtistId === artist.id"
              @confirm="removeArtist(artist.id)"
            />
          </div>
        </article>
      </div>
    </div>
  </AdminPageShell>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-admin-list-card,
.vtx-admin-empty {
  @apply rounded-3xl border p-6;
  border-color: rgb(145 161 190 / 0.2);
  background: rgb(255 255 255 / 0.04);
}

.vtx-admin-list-card {
  @apply flex flex-col justify-between gap-5;
}
</style>
