<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const modelValue = defineModel<string | number | undefined>()
const attrs = useAttrs()

type InputColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type InputVariant = 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const forwardedAttrs = computed(() => {
  const { class: _class, color: _color, variant: _variant, size: _size, ...rest } = attrs
  return rest
})

const inputClass = computed(() => {
  const customClass = attrs.class
  return ['w-full', customClass]
})

const inputColor = computed(() => {
  const color = attrs.color

  if (
    color === 'primary'
    || color === 'secondary'
    || color === 'success'
    || color === 'info'
    || color === 'warning'
    || color === 'error'
    || color === 'neutral'
  ) {
    return color satisfies InputColor
  }

  return 'neutral' satisfies InputColor
})

const inputVariant = computed(() => {
  const variant = attrs.variant

  if (
    variant === 'outline'
    || variant === 'soft'
    || variant === 'subtle'
    || variant === 'ghost'
    || variant === 'none'
  ) {
    return variant satisfies InputVariant
  }

  return 'subtle' satisfies InputVariant
})

const inputSize = computed(() => {
  const size = attrs.size

  if (size === 'xs' || size === 'sm' || size === 'md' || size === 'lg' || size === 'xl') {
    return size satisfies InputSize
  }

  return 'lg' satisfies InputSize
})
</script>

<template>
  <UInput
    v-model="modelValue"
    v-bind="forwardedAttrs"
    :color="inputColor"
    :variant="inputVariant"
    :size="inputSize"
    :class="inputClass"
  >
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>

    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>

    <slot />
  </UInput>
</template>
