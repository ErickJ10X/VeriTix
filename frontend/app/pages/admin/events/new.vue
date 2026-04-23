<script setup lang="ts">
import type {
  AdminEventPayload,
  AdminOption,
  GenreOption,
  VenueOption,
} from '~/types'
import { useAdminEventsRepository } from '~/repositories/adminEventsRepository'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Nuevo evento | Admin VeriTix' })

const { createEvent: createAdminEvent, getFormOptions } = useAdminEventsRepository()
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
  submitting.value = true
  errorMessage.value = ''

  try {
    await createAdminEvent(payload)

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
    description="Crea una fecha nueva dentro del flujo operativo de eventos y configuralo antes de publicarlo."
    primary-action-to="/admin/events"
    primary-action-label="Volver a eventos"
  >
    <div class="mx-auto max-w-5xl space-y-6">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <AdminOverviewPanel
        eyebrow="Eventos"
        title="Alta de evento"
        description="Completa la ficha operativa y deja listo el evento para entrar al catalogo del dashboard."
        tone="subtle"
      >
        <template #actions>
          <div class="flex flex-wrap items-center gap-2">
            <BaseBadge kind="info" size="sm">
              {{ venues?.length || 0 }} venues
            </BaseBadge>
            <BaseBadge kind="tag" size="sm">
              {{ formats?.length || 0 }} formatos
            </BaseBadge>
            <BaseBadge kind="status" color="primary" size="sm">
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
