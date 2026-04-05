<template>
  <div class="vtx-page min-h-screen text-default">
    <BackgroundBase />
    <BackgroundSpectrum />
    <BackgroundTexture />

    <div class="relative z-10 flex min-h-screen flex-col">
      <LayoutHeader />

      <UMain class="flex flex-1 flex-col pb-6">
        <slot />
      </UMain>

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
