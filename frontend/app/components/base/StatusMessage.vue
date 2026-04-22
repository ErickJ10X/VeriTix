<script setup lang="ts">
const props = withDefaults(defineProps<{
  message: string
  tone?: 'error' | 'success'
}>(), {
  tone: 'error',
})

const alertColor = computed(() => (props.tone === 'success' ? 'success' : 'error'))
const alertIcon = computed(() => (props.tone === 'success' ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'))
</script>

<template>
  <UAlert
    :title="message"
    :color="alertColor"
    variant="soft"
    :icon="alertIcon"
  />
</template>
