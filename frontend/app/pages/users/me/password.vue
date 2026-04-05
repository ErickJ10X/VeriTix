<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

await navigateTo('/users/me#seguridad', {
  redirectCode: 301,
  replace: true,
})
</script>

<template>
  <div />
</template>
