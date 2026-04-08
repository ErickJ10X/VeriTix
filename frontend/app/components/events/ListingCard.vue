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
  <article class="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-default/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),linear-gradient(145deg,rgba(11,17,31,0.78),rgba(16,23,40,0.74))] p-2.5 shadow-[0_18px_44px_-40px_rgba(0,0,0,0.82)] backdrop-blur-xl transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-default/85 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03)),linear-gradient(145deg,rgba(12,18,32,0.82),rgba(18,25,42,0.78))] hover:shadow-[0_26px_54px_-42px_rgba(0,0,0,0.92)] focus-within:-translate-y-0.5 focus-within:border-default/85 focus-within:bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03)),linear-gradient(145deg,rgba(12,18,32,0.82),rgba(18,25,42,0.78))] focus-within:shadow-[0_26px_54px_-42px_rgba(0,0,0,0.92)] sm:p-3">
    <div class="relative overflow-hidden rounded-[0.95rem] border border-white/8 transition-colors duration-200 group-hover:border-default/55 group-focus-within:border-default/55">
      <NuxtImg
        :src="event.imageUrl ?? undefined"
        :alt="`Imagen de ${event.name}`"
        class="h-36 w-full object-cover transition duration-500 group-hover:scale-[1.015]"
        loading="lazy"
        width="900"
        height="1200"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        placeholder
      />

      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-90 group-focus-within:opacity-90" />
    </div>

    <div class="flex flex-1 flex-col px-0.5 pb-0.5 pt-3 sm:px-1">
      <div class="flex min-h-8 flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-default/65 bg-default/42 px-2.5 py-1 text-[0.75rem] font-medium text-toned transition-colors duration-200 group-hover:border-default/80 group-hover:bg-default/56 group-focus-within:border-default/80 group-focus-within:bg-default/56">
          <UIcon name="i-lucide-map-pin" class="size-3.5 text-primary/70" />
          <span class="leading-none">{{ event.venue.city }}</span>
        </span>

        <span v-if="event.format" class="inline-flex items-center gap-1.5 rounded-full border border-default/65 bg-default/42 px-2.5 py-1 text-[0.75rem] font-medium text-toned transition-colors duration-200 group-hover:border-default/80 group-hover:bg-default/56 group-focus-within:border-default/80 group-focus-within:bg-default/56">
          <UIcon name="i-lucide-ticket" class="size-3.5 text-primary/70" />
          <span class="leading-none truncate">{{ event.format.name }}</span>
        </span>
      </div>

      <div class="mt-3 min-h-[5.1rem] space-y-2">
        <h3 class="line-clamp-2 text-[1.02rem] font-semibold leading-[1.2] tracking-[-0.015em] text-highlighted transition-colors duration-300 group-hover:text-white sm:text-[1.08rem]">
          {{ event.name }}
        </h3>

        <p class="line-clamp-1 text-[0.92rem] font-medium tracking-[-0.01em] text-toned/88">
          {{ event.venue.name }}
        </p>
      </div>

      <div class="mt-auto border-t border-white/8 pt-3 transition-colors duration-200 group-hover:border-default/55 group-focus-within:border-default/55">
        <div class="flex items-end justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <p class="text-[0.63rem] font-semibold tracking-[0.12em] text-dimmed uppercase">
              Fecha
            </p>
            <p class="inline-flex items-center gap-2 text-[0.82rem] font-medium tracking-[-0.01em] text-muted/92 transition-colors duration-200 group-hover:text-toned group-focus-within:text-toned">
              <UIcon name="i-lucide-calendar-days" class="size-3.5 text-secondary/80 transition-colors duration-200 group-hover:text-primary/80 group-focus-within:text-primary/80" />
              <span class="truncate">{{ eventDate }}</span>
            </p>
          </div>

          <BasePrimaryButton
            :to="`/events/${event.id}`"
            size="sm"
            class="shrink-0 px-3.5 group-hover:shadow-[0_16px_28px_-20px_rgba(239,170,71,0.36)] group-focus-within:shadow-[0_16px_28px_-20px_rgba(239,170,71,0.36)]"
          >
            Reservar
          </BasePrimaryButton>
        </div>
      </div>
    </div>
  </article>
</template>
