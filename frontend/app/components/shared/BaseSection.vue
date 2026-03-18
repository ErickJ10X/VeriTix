<script setup lang="ts">
defineProps<{
  id?: string
}>()
</script>

<template>
  <section
    :id="id"
    class="relative py-16 lg:py-24 vtx-section-fade"
  >
    <UContainer>
      <slot />
    </UContainer>
  </section>
</template>
