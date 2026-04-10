<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Recuperar acceso | VeriTix',
  description: 'Pantalla de recuperacion de acceso de VeriTix con una composicion completa y coherente con el resto de la experiencia.',
})
</script>

<template>
  <AuthRecoveryPanel />
</template>
