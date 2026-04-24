<script setup lang="ts">
import type {
  AdminEventPayload,
  AdminOption,
  GenreOption,
  VenueOption,
} from '~/types'
import { useAdminEventsRepository } from '~/repositories/adminEventsRepository'
import { normalizeEventPayload } from '~/utils/admin/formSafeRails'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Nuevo evento | Admin VeriTix' })

const { createEvent: createAdminEvent, getFormOptions } = useAdminEventsRepository()
const { getApiErrorMessage } = useApiErrorMessage()

const venues = ref<VenueOption[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<AdminOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)
const errorMessage = ref('')

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function loadOptions() {
  loading.value = true

  try {
    const options = await getFormOptions()

    venues.value = options.venues ?? []
    genres.value = options.genres ?? []
    formats.value = options.formats ?? []
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar las opciones del evento.')
  }
  finally {
    loading.value = false
  }
}

async function createEvent(payload: AdminEventPayload) {
  if (submitting.value) {
    return
  }

  const normalizedPayload = normalizeEventPayload(payload)

  submitting.value = true
  errorMessage.value = ''

  try {
    await createAdminEvent(normalizedPayload)

    await navigateTo('/admin/events')
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
    title="Nuevo evento"
    description="Crea un evento y dejalo listo para publicar."
    primary-action-to="/admin/events"
    primary-action-label="Volver a eventos"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <AdminOverviewPanel
        title="Datos del evento"
        description="Completa los campos principales para crear la ficha."
        tone="subtle"
      >
        <template #actions>
          <div class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ venues?.length || 0 }} venues
            </BaseBadge>
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ formats?.length || 0 }} formatos
            </BaseBadge>
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ genres?.length || 0 }} generos
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
          v-else
          v-model:dirty="isFormDirty"
          :venues="venues"
          :genres="genres"
          :formats="formats"
          :submitting="submitting"
          submit-label="Crear evento"
          @submit="createEvent"
        />
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
