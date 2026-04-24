<script setup lang="ts">
import type {
  AdminArtistRecord,
  AdminOption,
  GenreOption,
  PaginatedMeta,
} from '~/types'
import { useAdminArtistsRepository } from '~/repositories/adminArtistsRepository'
import { PAGE_SIZE_OPTIONS } from '~/utils/admin/pagination'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Artistas | Admin VeriTix' })

const { deleteArtist: deleteAdminArtist, listArtists, listGenres } = useAdminArtistsRepository()
const { notifyApiError, notifySuccess } = useAppNotifications()

const artists = ref<AdminArtistRecord[]>([])
const genres = ref<GenreOption[]>([])
const pending = ref(true)
const deletingId = ref('')

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

function artistInitials(artist: AdminArtistRecord) {
  const initials = artist.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')

  return initials || 'A'
}

async function loadGenres() {
  try {
    genres.value = await listGenres()
  }
  catch {
    genres.value = []
  }
}

async function loadArtists(targetPage = page.value) {
  pending.value = true

  try {
    const response = await listArtists({
      pageValue: targetPage,
      pageSize: pageSize.value,
      search: filters.search,
      genreId: filters.genreId,
      isActive: filters.isActive,
    })

    artists.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar los artistas.', { id: 'admin-artists-load-error' })
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

  try {
    await deleteAdminArtist(artistId)

    notifySuccess('Artista eliminado correctamente.', { id: `admin-artists-delete-${artistId}` })
    await loadArtists(page.value)
  }
  catch (error) {
    notifyApiError(error, 'No pudimos eliminar el artista.', { id: `admin-artists-delete-error-${artistId}` })
  }
  finally {
    deletingId.value = ''
  }
}

onMounted(() => {
  void Promise.all([loadGenres(), loadArtists()])
})
</script>

<template>
  <AdminPageShell
    title="Artistas"
    description="Gestioná el catálogo de artistas, el estado de publicación y los metadatos curatoriales."
    primary-action-to="/admin/artists/new"
    primary-action-label="Nuevo artista"
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="admin-artists-page">
      <AdminOverviewPanel
        eyebrow="Catálogo"
        title="Directorio de artistas"
        description="Buscá por nombre y filtrá por género o estado para mantener limpio el lineup."
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

          <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <USkeleton v-for="index in 6" :key="index" class="h-80 rounded-2xl" />
          </div>

          <AdminEmptyState
            v-else-if="artists.length === 0"
            icon="i-lucide-mic-2"
            title="Sin artistas"
            description="No encontramos artistas para estos filtros."
            action-label="Crear artista"
            action-to="/admin/artists/new"
          />

          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AdminCard
              v-for="artist in artists"
              :key="artist.id"
              class="h-full border-default/65 bg-elevated/20"
            >
              <div class="flex h-full flex-col gap-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <UAvatar
                      :src="artist.imageUrl || undefined"
                      :alt="artist.name"
                      :text="artistInitials(artist)"
                      size="xl"
                      class="ring-1 ring-default/60"
                    />

                    <div class="min-w-0 space-y-1">
                      <p class="truncate text-base font-semibold text-highlighted">
                        {{ artist.name }}
                      </p>
                      <p class="truncate text-sm text-toned">
                        {{ artist.slug }}
                      </p>
                    </div>
                  </div>

                  <span :class="artist.isActive ? 'text-success' : 'text-muted'" class="text-xs font-medium">
                    {{ artist.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>

                <div class="space-y-2 text-sm">
                  <div class="flex items-center justify-between border-b border-default/60 pb-2">
                    <span class="text-muted">País</span>
                    <span class="truncate text-toned">{{ artist.country || 'Sin definir' }}</span>
                  </div>

                  <div>
                    <p class="mb-1.5 text-muted">Géneros</p>
                    <div class="flex flex-wrap gap-1.5">
                      <span
                        v-for="genre in artist.genres.slice(0, 3)"
                        :key="genre.id"
                        class="rounded-full border border-default/60 px-2 py-0.5 text-xs font-medium text-toned"
                      >
                        {{ genre.name }}
                      </span>
                      <span
                        v-if="artist.genres.length > 3"
                        class="rounded-full border border-default/60 px-2 py-0.5 text-xs font-medium text-muted"
                      >
                        +{{ artist.genres.length - 3 }}
                      </span>
                      <span
                        v-if="artist.genres.length === 0"
                        class="text-xs text-muted"
                      >
                        Sin géneros asignados
                      </span>
                    </div>
                  </div>
                </div>

                <div class="mt-auto grid grid-cols-2 gap-2 border-t border-default/60 pt-3">
                  <BaseButton kind="secondary" size="sm" block :to="`/admin/artists/${artist.id}/edit`">
                    Editar
                  </BaseButton>
                  <AdminDeleteAction
                    item-label="el artista"
                    trigger-kind="tertiary"
                    trigger-class="w-full justify-center text-error hover:bg-error/10"
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
