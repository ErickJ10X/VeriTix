<script setup lang="ts">
import type { Money } from '~/types'
import { formatMoney } from '~/utils/currency-formatters'

const props = defineProps<{
  money: Money
}>()

const formatted = computed(() => {
  return formatMoney(props.money.amount, props.money.currency)
})
</script>

<template>
  <UBadge color="primary" variant="soft" size="sm" class="rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase md:text-sm">
    Desde {{ formatted }}
  </UBadge>
</template>
