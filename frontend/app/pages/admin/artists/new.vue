<script setup lang="ts">
import type {
  AdminArtistPayload,
  GenreOption,
} from '~/types'
import { useAdminArtistsRepository } from '~/repositories/adminArtistsRepository'
import { normalizeArtistPayload } from '~/utils/admin/formSafeRails'

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
  if (submitting.value) {
    return
  }

  const normalizedPayload = normalizeArtistPayload(payload)

  submitting.value = true
  errorMessage.value = ''

  try {
    await createAdminArtist(normalizedPayload)

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
    description="Crea un artista y dejalo listo para asociar a eventos."
    primary-action-to="/admin/artists"
    primary-action-label="Volver a artistas"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <AdminOverviewPanel
        title="Datos del artista"
        description="Completa la ficha principal para catalogo y búsqueda."
        tone="subtle"
      >
        <template #actions>
          <div class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ genres?.length || 0 }} géneros
            </BaseBadge>
          </div>
        </template>

        <template v-if="loading">
          <div class="space-y-4">
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-24 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
          </div>
        </template>

        <AdminArtistForm
          v-else
          :genres="genres"
          :submitting="submitting"
          submit-label="Crear artista"
          @submit="createArtist"
        />
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
