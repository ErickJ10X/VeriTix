<script setup lang="ts">
import type { AdminEventPayload, AdminOption, GenreOption, PaginatedResponse, VenueOption } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Nuevo evento admin | VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const genres = ref<GenreOption[]>([])
const venues = ref<VenueOption[]>([])
const formats = ref<AdminOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

const creationSurface = {
  eyebrow: 'Nuevo registro',
  title: 'Diseña el próximo evento',
  description: 'Construye la ficha operativa con contexto visual, datos de venta y metadatos curatoriales en una sola superficie.',
  icon: 'i-lucide-calendar-plus-2',
  variant: 'warning',
  highlights: ['Venue y aforo', 'Venta y timing', 'Imagen y géneros', 'Salida directa a edición'],
} as const

async function loadOptions() {
  loading.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    const [genresResponse, venuesResponse, formatsResponse] = await Promise.all([
      apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
      apiRequest<PaginatedResponse<VenueOption>>('/venues', { method: 'GET' }),
      apiRequest<PaginatedResponse<AdminOption>>('/concert-formats', { method: 'GET' }),
    ])

    genres.value = genresResponse
    venues.value = venuesResponse.data
    formats.value = formatsResponse.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar las opciones del formulario.')
  }
  finally {
    loading.value = false
  }
}

async function createEvent(payload: AdminEventPayload) {
  submitting.value = true
  errorMessage.value = ''

  try {
    const created = await apiRequest<{ id: string }, AdminEventPayload>('/admin/events', {
      method: 'POST',
      headers: requireAdminHeaders(),
      body: payload,
    })

    await navigateTo(`/admin/events/${created.id}/edit`)
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos crear el evento.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadOptions()
})
</script>

<template>
  <AdminPageShell
    title="Crear evento"
    description="Alta operativa de un nuevo evento con venue, formato y géneros."
  >
    <div class="space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-14 rounded-2xl" />
        <USkeleton class="h-36 rounded-2xl" />
        <USkeleton class="h-14 rounded-2xl" />
      </div>

      <AdminFormSurface
        v-else
        :eyebrow="creationSurface.eyebrow"
        :title="creationSurface.title"
        :description="creationSurface.description"
        :icon="creationSurface.icon"
        :variant="creationSurface.variant"
        :highlights="creationSurface.highlights"
      >
        <AdminEventForm
          :genres="genres"
          :venues="venues"
          :formats="formats"
          :submitting="submitting"
          submit-label="Crear evento"
          @submit="createEvent"
        />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
