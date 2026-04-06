<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    tone?: 'primary' | 'secondary' | 'urgent'
    to?: string
    href?: string
    type?: 'button' | 'submit' | 'reset'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    block?: boolean
    variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
  }>(),
  {
    label: 'Accion',
    tone: 'primary',
    type: 'button',
    size: 'lg',
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
    :size="size"
    :variant="variant"
    :color="color"
    :block="block"
    class="cursor-pointer transition-transform duration-150 active:translate-y-px"
  >
    <slot>
      {{ label }}
    </slot>
  </UButton>
</template>
