<script setup lang="ts">
import type {
  AdminEventDetail,
  AdminEventPayload,
  AdminOption,
  GenreOption,
  PaginatedResponse,
  VenueOption,
} from '~/types'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Editar evento | Admin VeriTix' })

const route = useRoute()
const eventId = computed(() => String(route.params.id || ''))

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()

const event = ref<AdminEventDetail | null>(null)
const venues = ref<VenueOption[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<AdminOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function getStatusTone(status: string) {
  if (status === 'PUBLISHED') {
    return 'success'
  }
  if (status === 'DRAFT') {
    return 'warning'
  }
  if (status === 'CANCELLED') {
    return 'error'
  }

  return 'neutral'
}

async function loadOptions() {
  const [venuesResponse, genresResponse, formatsResponse] = await Promise.all([
    apiRequest<PaginatedResponse<VenueOption>>('/venues', { method: 'GET' }),
    apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
    apiRequest<PaginatedResponse<AdminOption>>('/concert-formats', { method: 'GET' }),
  ])

  venues.value = venuesResponse.data
  genres.value = genresResponse
  formats.value = formatsResponse.data
}

async function loadEvent() {
  loading.value = true
  errorMessage.value = ''

  try {
    event.value = await apiRequest<AdminEventDetail>(`/admin/events/${eventId.value}`, {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Evento no encontrado.',
      })
    }

    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el evento.')
  }
  finally {
    loading.value = false
  }
}

async function updateEvent(payload: AdminEventPayload) {
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    event.value = await apiRequest<AdminEventDetail, AdminEventPayload>(`/admin/events/${eventId.value}`, {
      method: 'PATCH',
      headers: requireAdminHeaders(),
      body: payload,
    })

    successMessage.value = 'Evento actualizado correctamente.'
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos actualizar el evento.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await ensureAdminSession()
  await Promise.all([loadOptions(), loadEvent()])
})
</script>

<template>
  <AdminPageShell
    title="Editar evento"
    description="Ajusta los datos operativos del evento, su programación y las opciones de venta."
    primary-action-to="/admin/events"
    primary-action-label="Volver a eventos"
  >
    <div class="space-y-8">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <AdminOverviewPanel
        eyebrow="Eventos"
        title="Ficha de evento"
        description="Actualiza la información seleccionada sin salir del flujo operativo del dashboard."
        tone="subtle"
      >
        <template #actions>
          <div v-if="event" class="flex items-center gap-2">
            <BaseBadge kind="status" :color="getStatusTone(event.status)" size="sm">
              {{ event.status }}
            </BaseBadge>
          </div>
        </template>

        <UiGlassPanel tone="strong" padding="lg" radius="xl" class="min-w-0">
          <template v-if="loading">
            <div class="space-y-4">
              <USkeleton class="h-11 w-full rounded-lg" />
              <USkeleton class="h-11 w-full rounded-lg" />
              <USkeleton class="h-24 w-full rounded-lg" />
              <USkeleton class="h-11 w-full rounded-lg" />
            </div>
          </template>

          <AdminEventForm
            v-else-if="event"
            :initial-value="event"
            :venues="venues"
            :genres="genres"
            :formats="formats"
            :submitting="submitting"
            submit-label="Guardar cambios"
            @submit="updateEvent"
          />
        </UiGlassPanel>
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
