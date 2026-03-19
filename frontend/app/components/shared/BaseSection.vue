<script setup lang="ts">
defineProps<{
  id?: string
}>()
</script>

<template>
  <section
    :id="id"
    class="vtx-section vtx-section-fade relative scroll-mt-36 py-14 sm:scroll-mt-40 sm:py-16 lg:scroll-mt-44 lg:py-24"
  >
    <UContainer>
      <slot />
    </UContainer>
  </section>
</template>

<style scoped>
.vtx-section {
  position: relative;
}

.vtx-section::before {
  content: '';
  position: absolute;
  inset: 0 auto auto;
  width: min(24rem, 64vw);
  height: 1px;
  background: linear-gradient(90deg, rgb(239 170 71 / 0.7), rgb(20 128 188 / 0.45), rgb(255 255 255 / 0));
}

.vtx-section-fade {
  animation: section-fade-in 700ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .vtx-section-fade {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes section-fade-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
