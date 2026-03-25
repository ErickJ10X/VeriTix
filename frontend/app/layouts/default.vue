<template>
  <div class="vtx-page min-h-screen text-default">
    <BackgroundsBackgroundBase />
    <BackgroundsBackgroundSpectrum />
    <BackgroundsTexturedBackdrop />

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
</style>
