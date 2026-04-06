<script setup lang="ts">
import type { EventCatalogItem } from '~/types'
import { formatEventDate } from '~/utils/date-formatters'

const props = defineProps<{
  event: EventCatalogItem
}>()

const eventDate = computed(() => {
  return formatEventDate(props.event.dateISO)
})
</script>

<template>
  <article class="group flex h-full flex-col rounded-[1.4rem] border border-default/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),linear-gradient(145deg,rgba(11,17,31,0.78),rgba(16,23,40,0.74))] p-3 shadow-[0_18px_44px_-40px_rgba(0,0,0,0.82)] backdrop-blur-xl transition-all duration-200 hover:border-primary/22 hover:shadow-[0_20px_54px_-44px_rgba(239,170,71,0.34)] sm:p-3.5">
    <div class="relative overflow-hidden rounded-[1rem] border border-white/8">
      <NuxtImg
        :src="event.imageUrl ?? undefined"
        :alt="`Imagen de ${event.name}`"
        class="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        loading="lazy"
        width="900"
        height="1200"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        placeholder
      />

      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
    </div>

    <div class="flex flex-1 flex-col gap-4 px-1 pb-1 pt-3 sm:px-1.5">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.72rem] font-medium text-dimmed">
        <span class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-map-pin" class="size-3.5 text-primary/80" />
          {{ event.venue.city }}
        </span>

        <span v-if="event.format" class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-ticket" class="size-3.5 text-primary/80" />
          {{ event.format.name }}
        </span>
      </div>

      <div class="space-y-2">
        <h3 class="font-display text-[1.18rem] leading-snug text-highlighted transition-colors duration-300 group-hover:text-auric-200 sm:text-[1.28rem]">
          {{ event.name }}
        </h3>

        <p class="text-[0.92rem] text-toned">
          {{ event.venue.name }}
        </p>

        <p class="inline-flex items-center gap-1.5 text-[0.76rem] font-medium tracking-[0.08em] text-dimmed uppercase">
          <UIcon name="i-lucide-calendar-days" class="size-3.5 text-secondary/80" />
          <span>{{ eventDate }}</span>
        </p>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 border-t border-white/8 pt-3">
        <span class="text-[0.72rem] font-semibold tracking-[0.16em] text-dimmed uppercase">
          {{ event.currency }}
        </span>

        <BasePrimaryButton
          :to="`/events/${event.id}`"
          size="sm"
          class="px-3.5"
        >
          Reservar
        </BasePrimaryButton>
      </div>
    </div>
  </article>
</template>
