<script setup lang="ts">
const steps = [
  {
    id: 1,
    title: 'Busca',
    description: 'Encuentra conciertos por artista, ciudad o genero con un buscador directo.',
    accent: '#1480BC',
  },
  {
    id: 2,
    title: 'Elige',
    description: 'Compara eventos destacados, revisa disponibilidad y selecciona tu experiencia.',
    accent: '#ECB04D',
  },
  {
    id: 3,
    title: 'Compra',
    description: 'Confirma tu entrada y preparate para vivir una noche que valga la pena recordar.',
    accent: '#039B78',
  },
]
</script>

<template>
  <SharedBaseSection id="como-funciona">
    <SharedSectionHeading
      eyebrow="Flujo"
      title="Como funciona"
      description="Tres pasos simples para pasar de la inspiracion al concierto en vivo."
      :center="true"
    />

    <div class="mt-8 grid gap-5 md:grid-cols-3 vtx-stagger">
      <SharedBaseCard
        v-for="step in steps"
        :key="step.id"
      >
        <div class="space-y-3">
          <p
            class="text-xs tracking-[0.22em] uppercase"
            :style="{ color: step.accent }"
          >
            Paso {{ step.id }}
          </p>

          <h3 class="font-display text-3xl text-highlighted">
            {{ step.title }}
          </h3>

          <p class="text-sm leading-relaxed text-toned md:text-base">
            {{ step.description }}
          </p>
        </div>
      </SharedBaseCard>
    </div>
  </SharedBaseSection>
</template>
