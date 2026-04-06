<script setup lang="ts">
import { formatEventDate } from '~/utils/date-formatters'

const route = useRoute()

const eventId = computed(() => {
  return typeof route.params.id === 'string' ? route.params.id : ''
})

const { data: event, status } = await usePublicEvent(eventId)

useSeoMeta({
  title: () => event.value ? `${event.value.name} | VeriTix` : 'Evento | VeriTix',
  description: () => event.value?.description ?? 'Detalle del evento en VeriTix.',
})

const eventDate = computed(() => {
  return event.value ? formatEventDate(event.value.dateISO) : ''
})

const eventLocation = computed(() => {
  if (!event.value) {
    return ''
  }

  return `${event.value.venue.city} · ${event.value.venue.name}`
})

const doorsOpen = computed(() => {
  return event.value?.doorsOpenISO ? formatEventDate(event.value.doorsOpenISO) : 'Por confirmar'
})

const genreLabels = computed(() => {
  return event.value?.genres.map(genre => genre.name).join(' · ') ?? ''
})
</script>

<template>
  <UiEventsPageShell variant="detail">
      <div v-if="status === 'pending'" class="space-y-6">
        <USkeleton class="h-16 rounded-2xl" />
        <USkeleton class="h-120 rounded-3xl" />
      </div>

      <div v-else-if="!event" class="rounded-3xl border border-default/65 bg-default/8 px-6 py-16 text-center">
        <p class="text-lg font-semibold text-highlighted">
          No encontramos este evento.
        </p>
      </div>

      <div v-else class="relative mx-auto max-w-6xl space-y-8">
        <NuxtLink to="/events" class="inline-flex items-center gap-2 text-sm text-toned transition-colors hover:text-highlighted">
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          Volver a eventos
        </NuxtLink>

        <div class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div class="overflow-hidden rounded-[1.6rem] border border-default/65 bg-default/8 p-3 shadow-[0_20px_60px_-48px_rgba(0,0,0,0.82)]">
            <NuxtImg
              :src="event.imageUrl ?? undefined"
              :alt="`Imagen de ${event.name}`"
              class="min-h-88 w-full rounded-[1.05rem] object-cover lg:min-h-136"
              width="1200"
              height="1600"
              sizes="(max-width: 1023px) 100vw, 58vw"
              placeholder
            />
          </div>

          <div class="space-y-8">
            <div class="space-y-5 border-b border-default/55 pb-7">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="genre in event.genres"
                  :key="genre.id"
                  class="inline-flex items-center rounded-full border border-default/60 bg-default/8 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] text-toned uppercase"
                >
                  {{ genre.name }}
                </span>
              </div>

              <div class="space-y-3">
                <h1 class="font-display text-3xl leading-tight text-highlighted sm:text-4xl lg:text-[3rem]">
                  {{ event.name }}
                </h1>

                <p v-if="genreLabels" class="text-sm tracking-[0.08em] text-dimmed uppercase">
                  {{ genreLabels }}
                </p>
              </div>
            </div>

            <div class="grid gap-8 border-b border-default/55 pb-8 sm:grid-cols-2">
              <div class="space-y-2">
                <p class="text-[0.68rem] font-semibold tracking-[0.2em] text-dimmed uppercase">
                  Fecha
                </p>
                <p class="text-base font-semibold text-highlighted">
                  {{ eventDate }}
                </p>
              </div>

              <div class="space-y-2">
                <p class="text-[0.68rem] font-semibold tracking-[0.2em] text-dimmed uppercase">
                  Puertas
                </p>
                <p class="text-base font-semibold text-highlighted">
                  {{ doorsOpen }}
                </p>
              </div>

              <div class="space-y-2 sm:col-span-2">
                <p class="text-[0.68rem] font-semibold tracking-[0.2em] text-dimmed uppercase">
                  Ubicación
                </p>
                <p class="text-base font-semibold text-highlighted">
                  {{ eventLocation }}
                </p>
                <p class="text-sm text-toned">
                  {{ event.venue.address }}
                </p>
              </div>
            </div>

            <div class="space-y-5 border-b border-default/55 pb-8">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p class="text-[0.68rem] font-semibold tracking-[0.2em] text-dimmed uppercase">
                    Reserva
                  </p>
                  <p class="mt-2 text-sm text-toned">
                    {{ event.venue.name }}
                  </p>
                </div>

                <BasePrimaryButton size="lg" class="px-6">
                  Reservar
                </BasePrimaryButton>
              </div>
            </div>

            <div v-if="event.description" class="space-y-3">
              <p class="text-[0.68rem] font-semibold tracking-[0.2em] text-dimmed uppercase">
                Detalle
              </p>
              <p class="max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
                {{ event.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
  </UiEventsPageShell>
</template>
