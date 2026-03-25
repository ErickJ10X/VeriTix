<script setup lang="ts">
const sections = useHomepageSections()
const { scrollToSection } = useSectionScroll()
const mobileSection = ref('')

// TODO: Replace with actual auth state from nuxt-auth-utils or similar
const isAuthenticated = ref(false)

const mobileSectionOptions = computed(() => {
  return sections.map(section => ({
    label: section.label,
    value: section.id,
  }))
})

function onMobileNavigate(value: string | undefined) {
  if (!value) {
    return
  }

  scrollToSection(value)
  mobileSection.value = ''
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default/45 bg-default/82 backdrop-blur-sm">
    <UContainer class="py-2.5 sm:py-3">
      <div class="vtx-header-minimal flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        <a
          href="#hero"
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
        </a>

        <nav aria-label="Navegación principal" class="vtx-header-nav relative hidden items-center justify-center gap-6 sm:flex">
          <span class="vtx-header-nav-glow hidden lg:block" aria-hidden="true" />

          <a
            v-for="item in sections"
            :key="item.id"
            :href="`#${item.id}`"
            class="vtx-header-link text-toned uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          >
            {{ item.label }}
          </a>
        </nav>

        <!-- Auth buttons -->
        <div class="vtx-auth-buttons flex shrink-0 items-center gap-3">
          <template v-if="!isAuthenticated">
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

          <template v-else>
            <!-- TODO: Add user dropdown when auth is implemented -->
            <NuxtLink
              to="#eventos"
              class="vtx-auth-link vtx-auth-link--primary"
            >
              Cartel
            </NuxtLink>
          </template>
        </div>
      </div>

      <div class="mt-2 sm:hidden">
        <div class="vtx-header-minimal px-3 py-2.5">
          <label class="sr-only" for="header-mobile-nav">
            Navegacion principal
          </label>

          <USelect
            id="header-mobile-nav"
            v-model="mobileSection"
            class="w-full"
            color="neutral"
            variant="subtle"
            placeholder="Navegar por seccion"
            :items="mobileSectionOptions"
            :ui="{
              base: 'w-full text-[0.72rem] tracking-widest uppercase',
            }"
            @update:model-value="onMobileNavigate"
          />
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

.vtx-header-nav-glow {
  @apply h-px w-[2.4rem];
  background: linear-gradient(90deg, rgb(239 170 71 / 0.82), rgb(20 128 188 / 0.82));
}

.vtx-header-link {
  @apply relative inline-flex items-center justify-center py-1 text-[0.72rem] tracking-[0.16em] no-underline transition-all duration-200;
  transition-property: color, transform;
}

.vtx-header-link::after {
  @apply absolute left-0 right-0 h-px transition-all duration-200;
  content: '';
  bottom: -0.12rem;
  background: linear-gradient(
    90deg,
    rgb(239 170 71 / 0),
    rgb(239 170 71 / 0.85),
    rgb(20 128 188 / 0.85),
    rgb(239 170 71 / 0)
  );
  transform: scaleX(0.2);
  transform-origin: center;
  opacity: 0;
  transition-property: transform, opacity;
}

.vtx-header-link:hover,
.vtx-header-link:focus-visible {
  @apply text-white/98;
  transform: translateY(-1px);
}

.vtx-header-link:hover::after,
.vtx-header-link:focus-visible::after {
  transform: scaleX(1);
  opacity: 1;
}

/* Auth buttons */
.vtx-auth-buttons {
  gap: 0.5rem;
}

.vtx-auth-link {
  position: relative;
  padding: 0.375rem 0.875rem;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 0.5rem;
  transition: all 0.25s ease;
}

.vtx-auth-link--ghost {
  color: rgb(170 180 205);
  background: transparent;
}

.vtx-auth-link--ghost:hover {
  color: rgb(246 248 255);
  background: rgb(255 255 255 / 0.08);
}

.vtx-auth-link--primary {
  color: rgb(246 248 255);
  background: linear-gradient(135deg, rgb(239 170 71 / 0.85), rgb(20 128 188 / 0.75));
  border: 1px solid rgb(239 170 71 / 0.4);
  box-shadow:
    0 0 12px rgb(239 170 71 / 0.15),
    inset 0 1px 0 rgb(255 255 255 / 0.1);
}

.vtx-auth-link--primary::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgb(239 170 71 / 0.3), rgb(100 218 245 / 0.2), rgb(215 66 97 / 0.2));
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: -1;
  filter: blur(8px);
}

.vtx-auth-link--primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 2px 16px rgb(239 170 71 / 0.25),
    inset 0 1px 0 rgb(255 255 255 / 0.15);
}

.vtx-auth-link--primary:hover::before {
  opacity: 1;
}
</style>
