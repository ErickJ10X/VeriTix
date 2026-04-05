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
  <span class="inline-flex items-center rounded-full border border-primary/45 bg-primary/14 px-3 py-1 text-xs font-semibold tracking-[0.11em] text-primary uppercase md:text-sm">
    Desde {{ formatted }}
  </span>
</template>
