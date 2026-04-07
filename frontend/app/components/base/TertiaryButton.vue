<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
</script>

<template>
  <BaseButton v-bind="attrs" kind="tertiary">
    <slot />
  </BaseButton>
</template>
