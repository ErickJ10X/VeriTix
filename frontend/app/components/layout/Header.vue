<script setup lang="ts">
const { isAuthenticated, hydrated } = useAuth()
const route = useRoute()

const showGuestActions = computed(() => {
  return hydrated.value && !isAuthenticated.value
})

const showAccountAction = computed(() => {
  return hydrated.value && isAuthenticated.value
})

const isEventsRoute = computed(() => {
  return route.path.startsWith('/events')
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default/45 bg-default/82 backdrop-blur-sm">
    <UContainer class="py-2.5 sm:py-3">
      <div class="vtx-header-minimal grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 sm:px-4">
        <NuxtLink
          to="/"
          class="flex min-w-0 items-center gap-2.5 rounded-lg pr-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
        >
          <span class="vtx-header-brand-mark" aria-hidden="true" />

          <div class="min-w-0">
            <p class="truncate font-display text-[1.45rem] leading-none tracking-wide text-highlighted">
              Veritix
            </p>
            <p class="truncate text-[0.56rem] tracking-[0.3em] text-dimmed uppercase">
              progressive live atlas
            </p>
          </div>
        </NuxtLink>

        <nav class="flex items-center justify-center px-3" aria-label="Navegacion principal">
          <NuxtLink
            to="/events"
            class="vtx-nav-link"
            :class="isEventsRoute && 'vtx-nav-link--active'"
          >
            Eventos
          </NuxtLink>
        </nav>

        <div class="vtx-header-actions flex shrink-0 items-center gap-3">
          <!-- Auth buttons -->
          <div class="vtx-auth-buttons flex shrink-0 items-center gap-3">
            <template v-if="showGuestActions">
              <NuxtLink
                to="/login"
                class="vtx-auth-link vtx-auth-link--ghost"
              >
                Iniciar sesion
              </NuxtLink>

              <NuxtLink
                to="/register"
                class="vtx-auth-link vtx-auth-link--primary"
              >
                Registrarse
              </NuxtLink>
            </template>

            <template v-else-if="showAccountAction">
              <NuxtLink
                to="/users/me"
                class="vtx-auth-link vtx-auth-link--primary"
              >
                Mi cuenta
              </NuxtLink>
            </template>

            <template v-else>
              <div class="vtx-auth-skeleton" aria-hidden="true">
                <span class="vtx-auth-skeleton-pill vtx-auth-skeleton-pill--ghost" />
                <span class="vtx-auth-skeleton-pill vtx-auth-skeleton-pill--primary" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </UContainer>
  </header>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-header-minimal {
  @apply relative rounded-2xl;
  border: 1px solid rgb(145 161 190 / 0.25);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.01)),
    linear-gradient(136deg, rgb(11 17 31 / 0.74), rgb(16 23 40 / 0.78));
  box-shadow:
    0 14px 26px -24px rgb(0 0 0 / 0.78),
    inset 0 0 0 1px rgb(255 255 255 / 0.03);
}

.vtx-header-minimal::after {
  @apply absolute bottom-0 left-0 right-0 h-px pointer-events-none;
  content: '';
  background: linear-gradient(
    90deg,
    rgb(239 170 71 / 0),
    rgb(239 170 71 / 0.5),
    rgb(20 128 188 / 0.5),
    rgb(239 170 71 / 0)
  );
}

.vtx-header-brand-mark {
  @apply relative inline-flex h-8 w-8 rounded-full;
  border: 1px solid rgb(239 170 71 / 0.6);
  background:
    radial-gradient(circle at 32% 30%, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0) 42%),
    linear-gradient(135deg, rgb(239 170 71 / 0.75), rgb(20 128 188 / 0.75));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 0 18px rgb(239 170 71 / 0.32);
}

.vtx-header-brand-mark::before {
  @apply absolute rounded-full;
  content: '';
  inset: 0.35rem;
  border: 1px solid rgb(255 255 255 / 0.44);
  background: rgb(10 15 27 / 0.42);
}

/* Auth buttons */
.vtx-auth-buttons {
  gap: 0.5rem;
}

.vtx-header-actions {
  gap: 0.5rem;
}

.vtx-nav-link {
  @apply inline-flex items-center justify-center no-underline focus-visible:outline-none focus-visible:ring-2;
  min-height: 2.25rem;
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: rgb(170 180 205);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.vtx-nav-link:hover {
  border-bottom-color: rgb(239 170 71 / 0.28);
  color: rgb(246 248 255);
}

.vtx-nav-link--active {
  border-bottom-color: rgb(239 170 71 / 0.42);
  color: rgb(248 194 103);
}

@media (max-width: 639px) {
  .vtx-header-minimal {
    grid-template-columns: auto auto;
  }

  .vtx-header-minimal nav {
    order: 3;
    grid-column: 1 / -1;
    justify-content: center;
    padding-top: 0.25rem;
  }
}

.vtx-auth-skeleton {
  @apply inline-flex items-center gap-2;
}

.vtx-auth-skeleton-pill {
  @apply inline-flex rounded-full;
  height: 2rem;
  border: 1px solid transparent;
  background: rgb(255 255 255 / 0.05);
}

.vtx-auth-skeleton-pill--ghost {
  width: 6.35rem;
  border-color: rgb(170 180 205 / 0.18);
}

.vtx-auth-skeleton-pill--primary {
  width: 6.9rem;
  border-color: rgb(239 170 71 / 0.24);
  background: rgb(239 170 71 / 0.12);
}

.vtx-auth-link {
  @apply inline-flex items-center justify-center no-underline focus-visible:outline-none focus-visible:ring-2;
  position: relative;
  padding: 0.375rem 0.875rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 9999px;
  border: 1px solid transparent;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.vtx-auth-link--ghost {
  color: rgb(170 180 205);
  background: transparent;
  border-color: rgb(170 180 205 / 0.28);
}

.vtx-auth-link--ghost:hover {
  color: rgb(246 248 255);
  background: rgb(255 255 255 / 0.05);
  border-color: rgb(246 248 255 / 0.36);
}

.vtx-auth-link--primary {
  color: rgb(248 194 103);
  background: rgb(239 170 71 / 0.14);
  border-color: rgb(239 170 71 / 0.42);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 8px 18px -16px rgb(239 170 71 / 0.9);
}

.vtx-auth-link--primary:hover {
  color: rgb(255 248 234);
  background: rgb(239 170 71 / 0.24);
  border-color: rgb(253 217 152 / 0.7);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -16px rgb(239 170 71 / 0.95);
}
</style>
