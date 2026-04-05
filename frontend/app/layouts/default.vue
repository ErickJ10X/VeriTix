<template>
  <div class="vtx-page min-h-screen text-default">
    <BackgroundBase />
    <BackgroundSpectrum />
    <BackgroundTexture />

    <div class="relative z-10">
      <LayoutHeader />

      <main class="pb-6">
        <slot />
      </main>

      <LayoutFooter />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-page {
  @apply relative isolate;
}
</style>
