<script setup lang="ts">
import type { AdminEventRecord, PaginatedResponse } from '~/types'

definePageMeta({ middleware: 'admin' })

useSeoMeta({ title: 'Admin eventos | VeriTix' })

const apiRequest = useApiRequest()
const { ensureAdminSession, requireAdminHeaders } = useAdminApi()
const { getApiErrorMessage } = useApiErrorMessage()

const events = ref<AdminEventRecord[]>([])
const pending = ref(true)
const errorMessage = ref('')
const deletingEventId = ref('')

async function loadEvents() {
  pending.value = true
  errorMessage.value = ''

  try {
    await ensureAdminSession()
    const response = await apiRequest<PaginatedResponse<AdminEventRecord>>('/admin/events', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: { page: 1, limit: 50 },
    })
    events.value = response.data
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos cargar los eventos admin.')
  }
  finally {
    pending.value = false
  }
}

async function removeEvent(eventId: string) {
  deletingEventId.value = eventId
  try {
    await apiRequest(`/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })
    await loadEvents()
  }
  catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No pudimos eliminar el evento.')
  }
  finally {
    deletingEventId.value = ''
  }
}

onMounted(() => {
  void loadEvents()
})
</script>

<template>
  <AdminPageShell
    title="Eventos admin"
    description="Catálogo operativo para crear, editar y retirar eventos del sistema."
    primary-action-to="/admin/events/new"
    primary-action-label="Crear evento"
  >
    <div class="space-y-6" data-testid="admin-events-page">
      <BaseStatusMessage v-if="errorMessage" :message="errorMessage" />

      <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
        <USkeleton v-for="index in 4" :key="index" class="h-44 rounded-3xl" />
      </div>

      <div v-else-if="events.length === 0" class="vtx-admin-empty">
        No hay eventos disponibles todavía.
      </div>

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <article v-for="event in events" :key="event.id" class="vtx-admin-list-card">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="soft">
                {{ event.status }}
              </UBadge>
              <span class="text-xs text-dimmed">{{ event.currency }}</span>
            </div>
            <h2 class="text-lg font-semibold text-highlighted">
              {{ event.name }}
            </h2>
            <p class="text-sm text-toned">
              {{ event.venue.name }} · {{ event.venue.city }}
            </p>
            <p class="text-sm text-dimmed">
              {{ new Date(event.eventDate).toLocaleString('es-ES') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <BaseSecondaryButton :to="`/admin/events/${event.id}/edit`" size="sm">
              Editar
            </BaseSecondaryButton>
            <AdminDeleteAction
              item-label="el evento"
              test-id="admin-event-delete-button"
              :pending="deletingEventId === event.id"
              @confirm="removeEvent(event.id)"
            />
          </div>
        </article>
      </div>
    </div>
  </AdminPageShell>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-admin-list-card,
.vtx-admin-empty {
  @apply rounded-3xl border p-6;
  border-color: rgb(145 161 190 / 0.2);
  background: rgb(255 255 255 / 0.04);
}

.vtx-admin-list-card {
  @apply flex flex-col justify-between gap-5;
}
</style>
