<script setup lang="ts">
import type { AdminEventDetail, AdminEventPayload, AdminOption, GenreOption, PaginatedResponse, VenueOption } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Editar evento admin | VeriTix' })

const route = useRoute()
const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const eventId = computed(() => String(route.params.id || ''))
const event = ref<AdminEventDetail | null>(null)
const genres = ref<GenreOption[]>([])
const venues = ref<VenueOption[]>([])
const formats = ref<AdminOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const editingSurface = computed(() => ({
  eyebrow: event.value?.status === 'DRAFT' ? 'Sesión en borrador' : 'Edición en vivo',
  title: event.value?.name ?? 'Ajusta este evento',
  description: 'Refina el contenido, la logística y la lectura visual del evento sin salir de una única superficie operativa.',
  icon: 'i-lucide-sliders-horizontal',
  highlights: [
    event.value?.venue.name ? `${event.value.venue.name} · ${event.value.venue.city}` : 'Venue operativo',
    event.value?.format?.name ?? 'Sin formato específico',
    `${event.value?.maxCapacity ?? 0} plazas`,
    event.value?.status ?? 'Sin estado',
  ],
}))

async function loadPage() {
  loading.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    const [eventResponse, genresResponse, venuesResponse, formatsResponse] = await Promise.all([
      apiRequest<AdminEventDetail>(`/admin/events/${eventId.value}`, {
        method: 'GET',
        headers: requireAdminHeaders(),
      }),
      apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
      apiRequest<PaginatedResponse<VenueOption>>('/venues', { method: 'GET' }),
      apiRequest<PaginatedResponse<AdminOption>>('/concert-formats', { method: 'GET' }),
    ])

    event.value = eventResponse
    genres.value = genresResponse
    venues.value = venuesResponse.data
    formats.value = formatsResponse.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar el evento.')
  }
  finally {
    loading.value = false
  }
}

async function updateEvent(payload: AdminEventPayload) {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    event.value = await apiRequest<AdminEventDetail, AdminEventPayload>(`/admin/events/${eventId.value}`, {
      method: 'PATCH',
      headers: requireAdminHeaders(),
      body: payload,
    })
    successMessage.value = 'Evento actualizado.'
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos actualizar el evento.')
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
  <AdminPageShell title="Editar evento" description="Ajusta contenido, fechas y configuración operativa del evento.">
    <div class="space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-14 rounded-2xl" />
        <USkeleton class="h-36 rounded-2xl" />
        <USkeleton class="h-14 rounded-2xl" />
      </div>

      <AdminFormSurface
        v-else-if="event"
        variant="warning"
        :eyebrow="editingSurface.eyebrow"
        :title="editingSurface.title"
        :description="editingSurface.description"
        :icon="editingSurface.icon"
        :highlights="editingSurface.highlights"
      >
        <AdminEventForm
          :initial-value="event"
          :genres="genres"
          :venues="venues"
          :formats="formats"
          :submitting="submitting"
          submit-label="Guardar cambios"
          @submit="updateEvent"
        />
      </AdminFormSurface>
    </div>
  </AdminPageShell>
</template>
