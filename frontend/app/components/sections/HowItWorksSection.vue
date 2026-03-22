<script setup lang="ts">
const steps = [
  {
    id: 1,
    title: 'Sintoniza',
    description: 'Abre el portal con artista, ciudad o genero y activa una primera lectura del cartel en segundos.',
    cue: 'Entrada',
    motif: 'Prisma de busqueda',
    toneClass: 'vtx-flow-node--nebula',
  },
  {
    id: 2,
    title: 'Traza',
    description: 'Navega por geometria de generos, alterna filtros y ordena el mapa segun tu ruta sonora.',
    cue: 'Navegacion',
    motif: 'Reticula fractal',
    toneClass: 'vtx-flow-node--auric',
  },
  {
    id: 3,
    title: 'Reserva',
    description: 'Confirma tu entrada con contexto claro de precio y disponibilidad para cerrar el ritual sin friccion.',
    cue: 'Cierre',
    motif: 'Sello escarlata',
    toneClass: 'vtx-flow-node--crimson',
  },
] as const
</script>

<template>
  <SharedBaseSection id="como-funciona">
    <SharedSectionHeading
      eyebrow="Flujo ritual"
      title="Del hallazgo al escenario"
      description="Un recorrido redisenado para mantener orientacion, contraste y velocidad en cada paso."
      :center="true"
    />

    <div class="vtx-flow-grid vtx-stagger mt-8 grid gap-5 lg:grid-cols-3">
      <article
        v-for="step in steps"
        :key="step.id"
        class="vtx-flow-node"
        :class="step.toneClass"
      >
        <div class="space-y-3">
          <p class="text-[0.62rem] tracking-[0.22em] text-toned uppercase">
            {{ step.cue }}
          </p>

          <div class="flex items-center justify-between gap-3">
            <span
              class="vtx-flow-index"
            >
              0{{ step.id }}
            </span>
          </div>

          <h3 class="font-display text-4xl leading-none text-highlighted">
            {{ step.title }}
          </h3>

          <p class="text-sm leading-relaxed text-toned md:text-base">
            {{ step.description }}
          </p>

          <div class="vtx-flow-runes">
            <span class="text-[0.64rem] tracking-[0.22em] text-muted uppercase">
              {{ step.motif }}
            </span>
            <UIcon name="i-lucide-sparkles" class="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </article>
    </div>
  </SharedBaseSection>
</template>

<style scoped>
.vtx-flow-grid {
  position: relative;
}

.vtx-flow-grid::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgb(44 189 230 / 0),
    rgb(44 189 230 / 0.42),
    rgb(239 170 71 / 0.44),
    rgb(240 100 127 / 0.42),
    rgb(44 189 230 / 0)
  );
  transform: translateY(-50%);
}

.vtx-flow-node {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(145 161 190 / 0.34);
  border-radius: 1.1rem;
  padding: 1.1rem;
  background:
    linear-gradient(170deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.02)),
    linear-gradient(145deg, rgb(12 17 30 / 0.85), rgb(16 23 38 / 0.9));
  box-shadow:
    0 22px 36px -32px rgb(0 0 0 / 0.82),
    inset 0 0 0 1px rgb(255 255 255 / 0.04);
}

.vtx-flow-node::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-conic-gradient(
    from 14deg at 84% 18%,
    rgb(255 255 255 / 0.06) 0deg,
    rgb(255 255 255 / 0) 16deg,
    rgb(255 255 255 / 0.03) 26deg,
    rgb(255 255 255 / 0) 40deg
  );
  opacity: 0.66;
}

.vtx-flow-node--nebula::after,
.vtx-flow-node--auric::after,
.vtx-flow-node--crimson::after {
  content: '';
  position: absolute;
  inset: -35% -18% auto auto;
  width: 11rem;
  height: 11rem;
  border-radius: 9999px;
  pointer-events: none;
}

.vtx-flow-node--nebula::after {
  background: radial-gradient(circle at 50% 50%, rgb(44 189 230 / 0.28), rgb(255 255 255 / 0));
}

.vtx-flow-node--auric::after {
  background: radial-gradient(circle at 50% 50%, rgb(239 170 71 / 0.28), rgb(255 255 255 / 0));
}

.vtx-flow-node--crimson::after {
  background: radial-gradient(circle at 50% 50%, rgb(240 100 127 / 0.28), rgb(255 255 255 / 0));
}

.vtx-flow-index {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.15rem;
  height: 2.15rem;
  border: 1px solid rgb(145 161 190 / 0.74);
  border-radius: 9999px;
  background: rgb(17 24 39 / 0.72);
  font-size: 0.72rem;
  font-weight: 700;
  color: rgb(221 227 240 / 0.95);
  letter-spacing: 0.08em;
}

.vtx-flow-runes {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.55rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid rgb(145 161 190 / 0.32);
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.03);
}

@media (max-width: 1023px) {
  .vtx-flow-grid::before {
    display: none;
  }
}
</style>
