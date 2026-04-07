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
const search = ref('')

const filteredArtists = computed(() => {
  if (!search.value.trim()) return artists.value
  const term = search.value.toLowerCase()
  return artists.value.filter(a => 
    a.name.toLowerCase().includes(term) ||
    a.country?.toLowerCase().includes(term) ||
    a.genres.some(g => g.name.toLowerCase().includes(term))
  )
})

const metrics = computed(() => {
  const active = artists.value.filter(a => a.isActive).length
  const inactive = artists.value.length - active
  const withCountry = artists.value.filter(a => a.country).length
  return [
    { label: 'Total', value: artists.value.length },
    { label: 'Activos', value: active },
    { label: 'Inactivos', value: inactive },
    { label: 'Con país', value: withCountry },
  ]
})

async function loadArtists() {
  pending.value = true
  errorMessage.value = ''
  try {
    await ensureAdminSession()
    const response = await apiRequest<PaginatedResponse<AdminArtistRecord>>('/admin/artists', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: { page: 1, limit: 100 },
    })
    artists.value = response.data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los artistas.')
  } finally {
    pending.value = false
  }
}

async function removeArtist(artistId: string) {
  deletingArtistId.value = artistId
  try {
    await apiRequest(`/admin/artists/${artistId}`, { method: 'DELETE', headers: requireAdminHeaders() })
    await loadArtists()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el artista.')
  } finally {
    deletingArtistId.value = ''
  }
}

onMounted(() => {
  void loadArtists()
})
</script>

<template>
  <AdminPageShell
    title="Artistas"
    description="Directorio para crear, editar y retirar artistas del ecosistema."
    primary-action-to="/admin/artists/new"
    primary-action-label="Crear artista"
  >
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Error -->
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        icon="i-lucide-alert-circle"
      />

      <!-- Metrics -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 border-b border-default pb-8">
        <template v-if="pending">
          <USkeleton v-for="i in 4" :key="i" class="h-20" />
        </template>
        <template v-else>
          <div v-for="metric in metrics" :key="metric.label">
            <p class="text-sm text-muted">{{ metric.label }}</p>
            <p class="text-3xl font-semibold mt-1">{{ metric.value }}</p>
          </div>
        </template>
      </div>

      <!-- Search -->
      <div class="flex gap-4">
        <UInput
          v-model="search"
          placeholder="Buscar por nombre, país o género..."
          icon="i-lucide-search"
          class="max-w-md"
        />
      </div>

      <!-- List -->
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="i in 6" :key="i" class="h-20" />
      </div>

      <div v-else-if="filteredArtists.length === 0" class="text-center py-12 text-muted">
        <UIcon name="i-lucide-mic" class="size-12 mx-auto mb-4 opacity-50" />
        <p>No hay artistas disponibles.</p>
      </div>

      <div v-else class="divide-y divide-default">
        <div
          v-for="artist in filteredArtists"
          :key="artist.id"
          class="flex items-center justify-between py-4 hover:bg-elevated -mx-2 px-2 rounded transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="size-10 rounded-full bg-default border border-default flex items-center justify-center text-sm font-medium">
              {{ artist.name.charAt(0) }}
            </div>
            <div>
              <p class="font-medium">{{ artist.name }}</p>
              <p class="text-sm text-muted">
                {{ artist.country || 'País pendiente' }}
                <span v-if="artist.genres.length">· {{ artist.genres.map(g => g.name).join(', ') }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <UBadge :color="artist.isActive ? 'success' : 'neutral'" variant="soft" size="sm">
              {{ artist.isActive ? 'Activo' : 'Inactivo' }}
            </UBadge>
            <div class="flex items-center gap-2">
              <UButton
                :to="`/admin/artists/${artist.id}/edit`"
                color="neutral"
                variant="ghost"
                size="sm"
              >
                Editar
              </UButton>
              <AdminDeleteAction
                :item-label="artist.name"
                :pending="deletingArtistId === artist.id"
                @confirm="removeArtist(artist.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminPageShell>
</template>
