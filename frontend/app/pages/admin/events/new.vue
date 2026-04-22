<script setup lang="ts">
import type {
  AdminEventPayload,
  AdminOption,
  GenreOption,
  PaginatedResponse,
  VenueOption,
} from '~/types'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Nuevo evento | Admin VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const venues = ref<VenueOption[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<AdminOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

async function loadOptions() {
  loading.value = true

  try {
    const [venuesResponse, genresResponse, formatsResponse] = await Promise.all([
      apiRequest<PaginatedResponse<VenueOption>>('/venues', { method: 'GET' }),
      apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
      apiRequest<PaginatedResponse<AdminOption>>('/concert-formats', { method: 'GET' }),
    ])

    venues.value = venuesResponse.data
    genres.value = genresResponse
    formats.value = formatsResponse.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar las opciones del evento.')
  }
  finally {
    loading.value = false
  }
}

async function createEvent(payload: AdminEventPayload) {
  submitting.value = true
  errorMessage.value = ''

  try {
    await apiRequest('/admin/events', {
      method: 'POST',
      headers: requireAdminHeaders(),
      body: payload,
    })

    await navigateTo('/admin/events')
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos crear el evento.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await ensureAdminSession()
    await loadOptions()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos iniciar la sesion admin.')
    loading.value = false
  }
})
</script>

<template>
  <AdminPageShell
    title="Nuevo evento"
    description="Crea una fecha nueva dentro del flujo operativo de eventos y configuralo antes de publicarlo."
    primary-action-to="/admin/events"
    primary-action-label="Volver a eventos"
  >
    <div class="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <UiGlassPanel tone="strong" padding="lg" radius="xl" class="min-w-0">
        <div class="mb-6 flex flex-col gap-4 border-b border-default/55 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-2">
            <UiMetaLabel tone="accent">
              Eventos
            </UiMetaLabel>
            <div class="space-y-1">
              <h2 class="text-xl font-semibold tracking-tight text-highlighted">
                Alta de evento
              </h2>
              <p class="max-w-2xl text-sm leading-relaxed text-toned">
                Completa la ficha operativa y deja listo el evento para entrar al catalogo del dashboard.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <BaseBadge kind="info" size="sm">
              {{ venues.length }} venues
            </BaseBadge>
            <BaseBadge kind="tag" size="sm">
              {{ formats.length }} formatos
            </BaseBadge>
            <BaseBadge kind="status" color="primary" size="sm">
              {{ genres.length }} generos
            </BaseBadge>
          </div>
        </div>

        <AdminEventForm
          :venues="venues"
          :genres="genres"
          :formats="formats"
          :submitting="submitting"
          submit-label="Crear evento"
          @submit="createEvent"
        />
      </UiGlassPanel>
    </div>
  </AdminPageShell>
</template>
