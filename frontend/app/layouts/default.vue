<template>
  <div class="vtx-page min-h-screen bg-vtx-depth text-default">
    <SharedTexturedBackdrop />

    <div class="relative z-10">
      <LayoutSiteHeader />

      <main>
        <slot />
      </main>

      <LayoutSiteFooter />
    </div>
  </div>
</template>
