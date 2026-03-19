<template>
  <div class="vtx-page min-h-screen bg-vtx-depth text-default">
    <SharedTexturedBackdrop />

    <div class="relative z-10">
      <LayoutSiteHeader />

      <main class="pb-6">
        <slot />
      </main>

      <LayoutSiteFooter />
    </div>
  </div>
</template>

<style scoped>
.vtx-page {
  position: relative;
  isolation: isolate;
}

.vtx-page::before {
  content: '';
  position: fixed;
  inset: -44% -22% auto;
  height: 58rem;
  pointer-events: none;
  z-index: -2;
  background: conic-gradient(
    from 112deg at 48% 44%,
    rgb(44 189 230 / 0.22),
    rgb(255 255 255 / 0) 24%,
    rgb(239 170 71 / 0.26) 48%,
    rgb(255 255 255 / 0) 70%,
    rgb(215 66 97 / 0.22),
    rgb(255 255 255 / 0)
  );
  filter: blur(78px);
  animation: spectrum-drift 18s ease-in-out infinite alternate;
}

.vtx-page::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  opacity: 0.34;
  background-image:
    radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.09) 0.8px, transparent 0.8px),
    repeating-linear-gradient(
      150deg,
      rgb(255 255 255 / 0.015),
      rgb(255 255 255 / 0.015) 1px,
      transparent 1px,
      transparent 38px
    ),
    repeating-linear-gradient(
      30deg,
      rgb(255 255 255 / 0.012),
      rgb(255 255 255 / 0.012) 1px,
      transparent 1px,
      transparent 38px
    );
  background-size:
    4px 4px,
    auto,
    auto;
}

@media (prefers-reduced-motion: reduce) {
  .vtx-page::before {
    animation: none;
  }
}

@keyframes spectrum-drift {
  from {
    transform: translate3d(-2%, 0, 0) rotate(0deg);
  }

  to {
    transform: translate3d(2%, -2%, 0) rotate(10deg);
  }
}
</style>
