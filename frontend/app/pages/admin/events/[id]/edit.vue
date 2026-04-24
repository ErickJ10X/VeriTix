<script setup lang="ts">
import type {
  AdminEventDetail,
  AdminEventPayload,
  AdminOption,
  GenreOption,
  VenueOption,
} from '~/types'
import { useAdminEventsRepository } from '~/repositories/adminEventsRepository'
import { hasEventSemanticChanges, normalizeEventPayload } from '~/utils/admin/formSafeRails'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Editar evento | Admin VeriTix' })

const route = useRoute()
const eventId = computed(() => String(route.params.id || ''))

const { getFormOptions, getEvent: getAdminEvent, updateEvent: updateAdminEvent } = useAdminEventsRepository()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()

const event = ref<AdminEventDetail | null>(null)
const venues = ref<VenueOption[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<AdminOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const infoMessage = ref('')

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

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
  const options = await getFormOptions()

  venues.value = options.venues
  genres.value = options.genres
  formats.value = options.formats
}

async function loadEvent() {
  loading.value = true
  errorMessage.value = ''

  try {
    event.value = await getAdminEvent(eventId.value)
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
  if (submitting.value || !event.value) {
    return
  }

  const normalizedPayload = normalizeEventPayload(payload)

  if (!hasEventSemanticChanges(event.value, normalizedPayload)) {
    errorMessage.value = ''
    successMessage.value = ''
    infoMessage.value = 'No hay cambios para guardar.'
    return
  }

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  infoMessage.value = ''

  try {
    event.value = await updateAdminEvent(eventId.value, normalizedPayload)

    successMessage.value = 'Evento actualizado correctamente.'
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos actualizar el evento.')
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void Promise.all([loadOptions(), loadEvent()])
})
</script>

<template>
  <AdminPageShell
    title="Editar evento"
    description="Actualiza la ficha del evento y su configuración operativa."
    primary-action-to="/admin/events"
    primary-action-label="Volver a eventos"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />
      <BaseStatusMessage v-if="infoMessage" tone="info" :message="infoMessage" />
      <BaseStatusMessage v-if="successMessage" tone="success" :message="successMessage" />

      <AdminOverviewPanel
        title="Datos del evento"
        description="Edita los campos principales del evento seleccionado."
        tone="subtle"
      >
        <template #actions>
          <div v-if="event" class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ venues?.length || 0 }} venues
            </BaseBadge>
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ formats?.length || 0 }} formatos
            </BaseBadge>
            <BaseBadge kind="status" :color="getStatusTone(event.status)" size="sm" class="min-w-24 justify-center">
              {{ event.status }}
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

        <AdminEventForm
          v-else-if="event"
          v-model:dirty="isFormDirty"
          :initial-value="event"
          :venues="venues"
          :genres="genres"
          :formats="formats"
          :submitting="submitting"
          submit-label="Guardar cambios"
          @submit="updateEvent"
        />
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
