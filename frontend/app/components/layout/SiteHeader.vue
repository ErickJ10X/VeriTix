<script setup lang="ts">
const sections = useHomepageSections()
const { scrollToSection } = useSectionScroll()

function onMobileNavigate(event: Event) {
  const target = event.target

  if (!(target instanceof HTMLSelectElement)) {
    return
  }

  if (!target.value) {
    return
  }

  scrollToSection(target.value)

  target.value = ''
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default/45 bg-default/72 backdrop-blur-xl">
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

        <nav class="vtx-header-nav hidden items-center justify-center gap-6 sm:flex">
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

        <SharedCTAButton
          href="#eventos"
          label="Cartel"
          tone="primary"
          variant="outline"
          size="xs"
          class="vtx-header-cta shrink-0"
        />
      </div>

      <div class="mt-2 sm:hidden">
        <div class="vtx-header-minimal px-3 py-2.5">
          <label class="sr-only" for="header-mobile-nav">
            Navegacion principal
          </label>

          <select
            id="header-mobile-nav"
            class="vtx-mobile-nav-select"
            @change="onMobileNavigate"
          >
            <option value="">
              Navegar por seccion
            </option>
            <option
              v-for="item in sections"
              :key="`mobile-${item.id}`"
              :value="item.id"
            >
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>
    </UContainer>
  </header>
</template>

<style scoped>
.vtx-header-minimal {
  position: relative;
  border: 1px solid rgb(145 161 190 / 0.25);
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.01)),
    linear-gradient(136deg, rgb(11 17 31 / 0.74), rgb(16 23 40 / 0.78));
  box-shadow:
    0 14px 26px -24px rgb(0 0 0 / 0.78),
    inset 0 0 0 1px rgb(255 255 255 / 0.03);
}

.vtx-header-minimal::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgb(239 170 71 / 0),
    rgb(239 170 71 / 0.5),
    rgb(20 128 188 / 0.5),
    rgb(239 170 71 / 0)
  );
}

.vtx-header-brand-mark {
  position: relative;
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  border-radius: 9999px;
  border: 1px solid rgb(239 170 71 / 0.6);
  background:
    radial-gradient(circle at 32% 30%, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0) 42%),
    linear-gradient(135deg, rgb(239 170 71 / 0.75), rgb(20 128 188 / 0.75));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 0 18px rgb(239 170 71 / 0.32);
}

.vtx-header-brand-mark::before {
  content: '';
  position: absolute;
  inset: 0.35rem;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.44);
  background: rgb(10 15 27 / 0.42);
}

.vtx-header-nav {
  position: relative;
}

.vtx-header-nav-glow {
  width: 2.4rem;
  height: 1px;
  background: linear-gradient(90deg, rgb(239 170 71 / 0.82), rgb(20 128 188 / 0.82));
}

.vtx-header-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.28rem 0;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-decoration: none;
  transition:
    color 220ms ease,
    transform 220ms ease;
}

.vtx-header-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.12rem;
  height: 1px;
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
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.vtx-header-link:hover,
.vtx-header-link:focus-visible {
  color: rgb(246 248 255 / 0.98);
  transform: translateY(-1px);
}

.vtx-header-link:hover::after,
.vtx-header-link:focus-visible::after {
  transform: scaleX(1);
  opacity: 1;
}

:deep(.vtx-header-cta) {
  border-color: rgb(239 170 71 / 0.44);
  background: linear-gradient(150deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.02));
}

.vtx-mobile-nav-select {
  width: 100%;
  border: 1px solid rgb(145 161 190 / 0.35);
  border-radius: 0.78rem;
  padding: 0.58rem 0.78rem;
  background:
    linear-gradient(165deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.02)),
    linear-gradient(130deg, rgb(9 14 27 / 0.76), rgb(17 24 40 / 0.8));
  color: rgb(221 227 240 / 0.96);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.04);
}

.vtx-mobile-nav-select:focus-visible {
  outline: 2px solid rgb(239 170 71 / 0.45);
  outline-offset: 2px;
}
</style>
