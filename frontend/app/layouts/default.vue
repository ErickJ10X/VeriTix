<template>
  <div class="vtx-page min-h-screen text-default">
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
@reference "tailwindcss";

.vtx-page {
  @apply relative isolate;
}

.vtx-page::before {
  @apply fixed pointer-events-none -z-20;
  content: '';
  inset: -44% -22% auto;
  height: 58rem;
  background: conic-gradient(
    from 112deg at 48% 44%,
    rgb(44 189 230 / 0.22),
    rgb(255 255 255 / 0) 24%,
    rgb(239 170 71 / 0.26) 48%,
    rgb(255 255 255 / 0) 70%,
    rgb(215 66 97 / 0.22),
    rgb(255 255 255 / 0)
  );
  filter: blur(56px);
  animation: spectrum-drift 22s ease-in-out infinite alternate;
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
