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
    <UCard class="h-full">
      <div class="space-y-4">
        <div class="relative overflow-hidden rounded-xl border border-default/80">
          <NuxtImg
            :src="event.cover"
            :alt="`Portada de ${event.artist}`"
            class="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            width="600"
            height="336"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            placeholder
          />

          <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />

          <div class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-primary/18 to-transparent" />

          <UBadge
            :color="availability.color"
            variant="soft"
            class="absolute left-3 top-3"
          >
            {{ availability.label }}
          </UBadge>
        </div>

        <div class="space-y-2">
          <p class="vtx-prismatic-text text-[0.68rem] tracking-[0.24em] uppercase">
            {{ event.genre }}
          </p>

          <h3 class="font-display text-2xl leading-tight text-highlighted md:text-[1.7rem]">
            {{ event.artist }}
          </h3>

          <p class="text-sm text-toned">
            {{ eventLocation }}
          </p>

          <p class="text-sm text-default">
            {{ eventDate }}
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default/75 pt-3">
          <SharedEventPriceChip :money="event.price" />

          <SharedCTAButton
            href="#footer"
            label="Reservar"
            tone="primary"
            variant="outline"
            size="sm"
          />
        </div>
      </div>
    </UCard>
  </article>
</template>
