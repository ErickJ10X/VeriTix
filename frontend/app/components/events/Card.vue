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
  <article class="group relative h-full">
    <!-- Subtle glow behind the card on hover -->
    <div class="absolute -inset-px rounded-[1.45rem] bg-nebula-400 opacity-0 blur-xl transition duration-300 group-hover:opacity-8" />

    <UCard
      class="relative h-full overflow-hidden rounded-[1.4rem] border-white/10! bg-white/5! backdrop-blur-xl transition-all duration-300 group-hover:border-white/15! group-hover:bg-white/8!"
      :ui="{ body: 'h-full p-3 sm:p-3.5' }"
    >
      <div class="flex h-full flex-col gap-4">
        <div class="relative overflow-hidden rounded-[1rem] border border-white/10">
          <NuxtImg
            :src="event.cover"
            :alt="`Portada de ${event.artist}`"
            class="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            width="600"
            height="336"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            placeholder
          />

          <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-vtx-depth/50 to-transparent" />

          <UBadge
            :color="availability.color"
            variant="soft"
            class="absolute left-3 top-3 backdrop-blur-md"
          >
            {{ availability.label }}
          </UBadge>
        </div>

        <div class="flex-1 space-y-2.5 px-1 pb-1">
          <p class="vtx-prismatic-text text-[0.68rem] font-semibold tracking-[0.24em] uppercase">
            {{ event.genre }}
          </p>

          <h3 class="font-display text-[1.2rem] leading-snug text-white transition-colors duration-300 group-hover:text-auric-200 md:text-[1.35rem]">
            {{ event.artist }}
          </h3>

          <p class="text-[0.92rem] text-toned/90">
            {{ eventLocation }}
          </p>

          <p class="text-[0.92rem] text-default/80">
            {{ eventDate }}
          </p>
        </div>

        <div class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-1 pb-1 pt-3 transition-colors duration-300 group-hover:border-white/15">
          <EventsPriceChip :money="event.price" />

          <BaseCtaButton
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
