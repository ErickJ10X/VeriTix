<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin | VeriTix',
  description: 'Panel de administración para eventos, usuarios y artistas en VeriTix.',
})

const cards = [
  {
    eyebrow: 'Catálogo en vivo',
    title: 'Eventos',
    description: 'Crea, edita y retira eventos del catálogo.',
    to: '/admin/events',
    createTo: '/admin/events/new',
    createLabel: 'Nuevo evento',
    icon: 'i-lucide-calendar-range',
    accentClass: 'from-auric',
    highlights: ['Crear', 'Editar', 'Retirar'],
    featured: true,
  },
  {
    eyebrow: 'Accesos y roles',
    title: 'Usuarios',
    description: 'Gestiona accesos, roles y estado de cuentas.',
    to: '/admin/users',
    createTo: '/admin/users/new',
    createLabel: 'Nuevo usuario',
    icon: 'i-lucide-users',
    accentClass: 'from-cyan',
    highlights: ['Roles', 'Estado', 'Soporte'],
    featured: false,
  },
  {
    eyebrow: 'Directorio curado',
    title: 'Artistas',
    description: 'Mantén el directorio artístico y sus metadatos.',
    to: '/admin/artists',
    createTo: '/admin/artists/new',
    createLabel: 'Nuevo artista',
    icon: 'i-lucide-mic-vocal',
    accentClass: 'from-rose',
    highlights: ['Ficha', 'Visibilidad', 'Géneros'],
    featured: false,
  },
] as const
</script>

<template>
  <AdminPageShell
    eyebrow="Control room"
    title="Dashboard admin"
    description="Punto de control para empezar a operar eventos, usuarios y artistas desde la misma superficie."
  >
    <section class="space-y-5">
      <div class="vtx-admin-intro">
        <div class="space-y-3">
          <p class="text-[0.68rem] font-semibold tracking-[0.28em] text-secondary uppercase">
            Crear y operar
          </p>
          <h2 class="font-display text-3xl tracking-[0.03em] text-highlighted sm:text-[2.5rem]">
            Un dashboard más editorial, menos panel genérico.
          </h2>
        </div>

        <p class="max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
          Prioricé jerarquía, aire y acceso directo: un módulo principal con más peso visual y dos secundarios más compactos para que el dashboard se sienta diseñado, no simplemente maquetado.
        </p>
      </div>

      <div class="grid gap-5 xl:grid-cols-3">
        <AdminModuleCard
          v-for="card in cards"
          :key="card.to"
          :class="card.featured ? 'xl:col-span-2 xl:row-span-2' : 'xl:col-span-1'"
          :eyebrow="card.eyebrow"
          :title="card.title"
          :description="card.description"
          :icon="card.icon"
          :to="card.to"
          :create-to="card.createTo"
          :create-label="card.createLabel"
          :accent-class="card.accentClass"
          :highlights="card.highlights"
          :featured="card.featured"
        />
      </div>
    </section>
  </AdminPageShell>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-admin-intro {
  @apply flex flex-col gap-4 rounded-[1.75rem] border px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-end lg:justify-between;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--ui-bg) 78%, black),
      color-mix(in srgb, var(--ui-bg-elevated) 72%, black)
    );
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
}
</style>
