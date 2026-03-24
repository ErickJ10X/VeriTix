<script setup lang="ts">
const sections = useHomepageSections()
const { scrollToSection } = useSectionScroll()
const mobileSection = ref('')

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

        <UButton
          to="#eventos"
          color="primary"
          variant="outline"
          size="xs"
          class="shrink-0 border-primary/45 bg-gradient-to-br from-white/10 to-white/0"
        >
          Cartel
        </UButton>
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
            placeholder="Navegar por sección"
            :items="mobileSectionOptions"
            :ui="{
              base: 'w-full text-[0.72rem] tracking-[0.1em] uppercase',
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
</style>
