<script setup lang="ts">
const props = withDefaults(defineProps<{
  message: string
  tone?: 'error' | 'success'
}>(), {
  tone: 'error',
})

const messageClasses = computed(() => {
  if (props.tone === 'success') {
    return 'border-success/35 bg-success/10 text-success'
  }

  return 'border-error/40 bg-error/10 text-error'
})

const liveRole = computed(() => {
  return props.tone === 'success' ? 'status' : 'alert'
})
</script>

<template>
  <p
    :role="liveRole"
    aria-live="polite"
    class="rounded-2xl border px-4 py-3 text-sm"
    :class="messageClasses"
  >
    {{ message }}
  </p>
</template>
