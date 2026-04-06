<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    label?: string
    tone?: 'primary' | 'secondary' | 'urgent'
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit' | 'reset'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    block?: boolean
  }>(),
  {
    label: 'Accion',
    tone: 'primary',
    type: 'button',
    size: 'lg',
    block: false,
    to: undefined,
    href: undefined,
  },
)
</script>

<template>
  <BaseSecondaryButton
    v-if="props.tone === 'secondary'"
    :to="props.to"
    :href="props.href"
    :type="props.type"
    :size="props.size"
    :block="props.block"
  >
    <slot>
      {{ props.label }}
    </slot>
  </BaseSecondaryButton>

  <BasePrimaryButton
    v-else
    :to="props.to"
    :href="props.href"
    :type="props.type"
    :size="props.size"
    :block="props.block"
    :class="props.tone === 'urgent' && '!border-error/18 !bg-error/10 !text-error hover:!border-error/28 hover:!bg-error/14 hover:!text-highlighted'"
  >
    <slot>
      {{ props.label }}
    </slot>
  </BasePrimaryButton>
</template>
