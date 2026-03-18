<script setup lang="ts">
import type { Event } from '~/types'
import { formatEventDate } from '~/utils/date-formatters'
import { formatEventLocation } from '~/utils/event-formatters'

const props = defineProps<{
  event: Event
}>()

const statusMap: Record<Event['availability'], { label: string, color: 'success' | 'warning' | 'error' }> = {
  available: { label: 'Disponible', color: 'success' },
  few_left: { label: 'Ultimos', color: 'warning' },
  sold_out: { label: 'Agotado', color: 'error' },
}

const availability = computed(() => {
  return statusMap[props.event.availability]
})

const eventDate = computed(() => {
  return formatEventDate(props.event.dateISO)
})

const eventLocation = computed(() => {
  return formatEventLocation(props.event)
})
</script>

<template>
  <article class="group h-full">
    <SharedBaseCard>
      <div class="space-y-4">
        <div class="relative overflow-hidden rounded-xl border border-default">
          <img
            :src="event.cover"
            :alt="`Portada de ${event.artist}`"
            class="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          >

          <UBadge
            :color="availability.color"
            variant="soft"
            class="absolute left-3 top-3"
          >
            {{ availability.label }}
          </UBadge>
        </div>

        <div class="space-y-2">
          <p class="text-xs tracking-[0.2em] text-secondary uppercase">
            {{ event.genre }}
          </p>

          <h3 class="font-display text-2xl leading-tight text-highlighted">
            {{ event.artist }}
          </h3>

          <p class="text-sm text-toned">
            {{ eventLocation }}
          </p>

          <p class="text-sm text-default">
            {{ eventDate }}
          </p>
        </div>

        <div>
          <SharedEventPriceChip :money="event.price" />
        </div>
      </div>
    </SharedBaseCard>
  </article>
</template>
