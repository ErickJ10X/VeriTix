<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    tone?: 'primary' | 'secondary' | 'urgent'
    to?: string
    href?: string
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
  }>(),
  {
    label: 'Accion',
    tone: 'primary',
    type: 'button',
    block: false,
    variant: 'solid',
  },
)

const color = computed(() => {
  if (props.tone === 'secondary') {
    return 'secondary'
  }

  if (props.tone === 'urgent') {
    return 'error'
  }

  return 'primary'
})
</script>

<template>
  <UButton
    :to="to"
    :href="href"
    :type="type"
    :variant="variant"
    :color="color"
    :block="block"
    class="rounded-full font-semibold transition duration-300 hover:-translate-y-0.5"
  >
    <slot>
      {{ label }}
    </slot>
  </UButton>
</template>
