<script setup lang="ts">
import type {
  AdminArtistRecord,
  AdminOption,
  GenreOption,
  PaginatedMeta,
  PaginatedResponse,
} from '~/types'
import { PAGE_SIZE_OPTIONS } from '~/utils/admin/eventsCatalog'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Artistas | Admin VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const artists = ref<AdminArtistRecord[]>([])
const genres = ref<GenreOption[]>([])
const pending = ref(true)
const deletingId = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS

const meta = ref<PaginatedMeta>({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
})

const statusOptions: AdminOption[] = [
  { id: 'true', name: 'Activo' },
  { id: 'false', name: 'Inactivo' },
]

const filters = reactive({
  search: '',
  genreId: '',
  isActive: '',
})

const genreFilterOptions = computed<AdminOption[]>(() => {
  return genres.value.map(genre => ({
    id: genre.id,
    name: genre.name,
  }))
})

async function loadGenres() {
  try {
    genres.value = await apiRequest<GenreOption[]>('/genres', { method: 'GET' })
  }
  catch {
    genres.value = []
  }
}

async function loadArtists(targetPage = page.value) {
  pending.value = true
  errorMessage.value = ''

  try {
    const response = await apiRequest<PaginatedResponse<AdminArtistRecord>>('/admin/artists', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: {
        page: targetPage,
        limit: pageSize.value,
        search: filters.search.trim() || undefined,
        genreId: filters.genreId || undefined,
        isActive: filters.isActive || undefined,
      },
    })

    artists.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los artistas.')
  }
  finally {
    pending.value = false
  }
}

function applyFilters() {
  page.value = 1
  void loadArtists(1)
}

function resetFilters() {
  filters.search = ''
  filters.genreId = ''
  filters.isActive = ''
  page.value = 1
  void loadArtists(1)
}

function goToPage(nextPage: number) {
  void loadArtists(nextPage)
}

async function removeArtist(artistId: string) {
  deletingId.value = artistId
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await apiRequest(`/admin/artists/${artistId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })

    successMessage.value = 'Artista eliminado correctamente.'
    await loadArtists(page.value)
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el artista.')
  }
  finally {
    deletingId.value = ''
  }
}

onMounted(async () => {
  await ensureAdminSession()
  await Promise.all([loadGenres(), loadArtists()])
})
</script>

<template>
  <AdminPageShell
    title="Artistas"
    description="Gestiona catálogo de artistas, estado de publicación y metadatos curatoriales."
    primary-action-to="/admin/artists/new"
    primary-action-label="Nuevo artista"
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="admin-artists-page">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <AdminOverviewPanel
        eyebrow="Catálogo"
        title="Directorio de artistas"
        description="Busca por nombre y filtra por género o estado para mantener limpio el lineup."
        tone="subtle"
      >
        <template #actions>
          <div class="flex items-center gap-3 sm:self-center">
            <BaseButton kind="tertiary" size="md" :disabled="pending" @click="resetFilters">
              Resetear
            </BaseButton>
            <BaseButton kind="primary" size="md" :loading="pending" @click="applyFilters">
              Aplicar
            </BaseButton>
          </div>
        </template>

        <div class="space-y-6">
          <AdminFiltersBar
            v-model:search="filters.search"
            v-model:page-size="pageSize"
            v-model:genre-id="filters.genreId"
            v-model:format-id="filters.isActive"
            :page-size-options="pageSizeOptions"
            :genres="genreFilterOptions"
            :formats="statusOptions"
            :visible-filters="['pageSize', 'genre', 'format']"
            search-label="Buscar artista"
            search-placeholder="Nombre del artista"
            genre-label="Género"
            genre-name="genreId"
            format-label="Estado"
            format-name="isActive"
            :loading="pending"
            class="w-full"
          />

          <AdminPaginationBar
            :page="meta.page"
            :total-pages="meta.totalPages"
            :total-items="meta.total"
            :page-size="meta.limit"
            :pending="pending"
            @change="goToPage"
          />

          <div class="space-y-4">
            <template v-if="pending">
              <USkeleton v-for="index in 4" :key="index" class="h-28 rounded-2xl" />
            </template>

            <AdminEmptyState
              v-else-if="artists.length === 0"
              icon="i-lucide-mic-2"
              title="Sin artistas"
              description="No encontramos artistas para estos filtros."
              action-label="Crear artista"
              action-to="/admin/artists/new"
            />

            <AdminCard
              v-for="artist in artists"
              v-else
              :key="artist.id"
              class="border-default/70 bg-elevated/20"
            >
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="space-y-2">
                  <p class="text-base font-semibold text-highlighted">
                    {{ artist.name }}
                  </p>
                  <p class="text-sm text-toned">
                    {{ artist.slug }}
                    <span v-if="artist.country"> · {{ artist.country }}</span>
                  </p>

                  <div class="flex flex-wrap items-center gap-2">
                    <BaseBadge kind="status" :color="artist.isActive ? 'success' : 'neutral'">
                      {{ artist.isActive ? 'Activo' : 'Inactivo' }}
                    </BaseBadge>
                    <BaseBadge v-for="genre in artist.genres.slice(0, 3)" :key="genre.id" kind="tag">
                      {{ genre.name }}
                    </BaseBadge>
                    <BaseBadge v-if="artist.genres.length > 3" kind="outline">
                      +{{ artist.genres.length - 3 }}
                    </BaseBadge>
                  </div>
                </div>

                <div class="flex items-center gap-2 self-start md:self-center">
                  <BaseButton kind="secondary" size="sm" :to="`/admin/artists/${artist.id}/edit`">
                    Editar
                  </BaseButton>
                  <AdminDeleteAction
                    item-label="el artista"
                    trigger-kind="secondary"
                    trigger-class="border-error/35 text-error hover:border-error/50 hover:bg-error/12 hover:text-error"
                    :pending="deletingId === artist.id"
                    @confirm="removeArtist(artist.id)"
                  />
                </div>
              </div>
            </AdminCard>
          </div>

          <AdminPaginationBar
            :page="meta.page"
            :total-pages="meta.totalPages"
            :total-items="meta.total"
            :page-size="meta.limit"
            :pending="pending"
            @change="goToPage"
          />
        </div>
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
