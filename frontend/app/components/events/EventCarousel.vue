<script setup lang="ts">
import type { Event } from '~/types'

defineProps<{
  events: Event[]
}>()
</script>

<template>
  <div v-if="events.length">
    <UCarousel
      :items="events"
      arrows
      dots
      class="-ms-4"
      :ui="{
        item: 'basis-[86%] ps-4 sm:basis-[48%]',
        prev: 'border border-default/70 bg-default/80 text-highlighted backdrop-blur-sm hover:bg-default',
        next: 'border border-default/70 bg-default/80 text-highlighted backdrop-blur-sm hover:bg-default',
      }"
    >
      <template #default="{ item }">
        <EventsEventCard :event="item" />
      </template>
    </UCarousel>
  </div>

  <p
    v-else
    class="rounded-2xl border border-default/75 bg-muted/50 px-6 py-8 text-center text-sm text-muted"
  >
    No hay conciertos para esos filtros.
  </p>
</template>
