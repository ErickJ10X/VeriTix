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
  <article class="group flex h-full flex-col rounded-[1.25rem] border border-default/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),linear-gradient(145deg,rgba(11,17,31,0.78),rgba(16,23,40,0.74))] p-2.5 shadow-[0_18px_44px_-40px_rgba(0,0,0,0.82)] backdrop-blur-xl transition-all duration-200 hover:border-primary/22 hover:shadow-[0_20px_54px_-44px_rgba(239,170,71,0.34)] sm:p-3">
    <div class="relative overflow-hidden rounded-[0.95rem] border border-white/8">
      <NuxtImg
        :src="event.imageUrl ?? undefined"
        :alt="`Imagen de ${event.name}`"
        class="h-36 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        loading="lazy"
        width="900"
        height="1200"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        placeholder
      />

      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
    </div>

    <div class="flex flex-1 flex-col px-0.5 pb-0.5 pt-2.5 sm:px-1">
      <div class="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] font-semibold tracking-[0.12em] text-dimmed uppercase">
        <span class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-map-pin" class="size-3.5 text-primary/70" />
          <span>{{ event.venue.city }}</span>
        </span>

        <span v-if="event.format" class="size-1 rounded-full bg-white/14" />

        <span v-if="event.format" class="truncate">
          {{ event.format.name }}
        </span>
      </div>

      <div class="mt-2.5 min-h-[4.8rem] space-y-1.5">
        <h3 class="line-clamp-2 font-display text-[1.02rem] leading-snug text-highlighted transition-colors duration-300 group-hover:text-auric-200 sm:text-[1.1rem]">
          {{ event.name }}
        </h3>

        <p class="line-clamp-1 text-sm text-toned">
          {{ event.venue.name }}
        </p>
      </div>

      <div class="mt-auto border-t border-white/8 pt-2.5">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <p class="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-[0.12em] text-secondary/85 uppercase">
              <UIcon name="i-lucide-calendar-days" class="size-3.5" />
              <span class="truncate">{{ eventDate }}</span>
            </p>

            <p class="text-[0.68rem] font-semibold tracking-[0.16em] text-dimmed uppercase">
              {{ event.currency }}
            </p>
          </div>

          <BasePrimaryButton
            :to="`/events/${event.id}`"
            size="sm"
            class="shrink-0 px-3"
          >
            Reservar
          </BasePrimaryButton>
        </div>
      </div>
    </div>
  </article>
</template>
