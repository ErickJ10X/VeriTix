<script setup lang="ts">
const { results, pending } = useEventSearch()

const featuredEvents = computed(() => {
  return results.value.slice(0, 6)
})
</script>

<template>
  <SharedBaseSection id="eventos">
    <SharedSectionHeading
      eyebrow="Cartel"
      title="Eventos destacados"
      description="Seleccion curada de conciertos con disponibilidad en tiempo real y jerarquia visual clara para decidir rapido."
    />

    <div
      v-if="pending"
      class="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      <USkeleton
        v-for="i in 3"
        :key="`skeleton-${i}`"
        class="h-105 rounded-2xl"
      />
    </div>

    <template v-else>
      <div class="mt-8 md:hidden">
        <EventsEventCarousel :events="featuredEvents" />
      </div>

      <div class="vtx-stagger mt-8 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-3">
        <EventsEventCard
          v-for="event in featuredEvents"
          :key="event.id"
          :event="event"
        />
      </div>

      <p
        v-if="!featuredEvents.length"
        class="vtx-panel mt-8 rounded-2xl px-6 py-8 text-center text-sm text-muted"
      >
        No encontramos conciertos para tu busqueda actual.
      </p>
    </template>
  </SharedBaseSection>
</template>
