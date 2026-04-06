<script setup lang="ts">
const props = withDefaults(defineProps<{
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  pending?: boolean
}>(), {
  pending: false,
})

const emit = defineEmits<{
  change: [page: number]
}>()

const pageNumbers = computed<(number | 'ellipsis')[]>(() => {
  const totalPages = Math.max(props.totalPages, 1)

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const current = Math.min(Math.max(props.page, 1), totalPages)
  const pages = new Set<number>([1, totalPages, current - 1, current, current + 1])

  if (current <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }

  if (current >= totalPages - 2) {
    pages.add(totalPages - 1)
    pages.add(totalPages - 2)
    pages.add(totalPages - 3)
  }

  const sortedPages = [...pages].filter(page => page >= 1 && page <= totalPages).sort((left, right) => left - right)
  const result: (number | 'ellipsis')[] = []

  for (const page of sortedPages) {
    const previous = result.at(-1)

    if (typeof previous === 'number' && page - previous > 1) {
      result.push('ellipsis')
    }

    result.push(page)
  }

  return result
})

const itemRangeLabel = computed(() => {
  if (props.totalItems === 0) {
    return '0 resultados'
  }

  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.totalItems)

  return `${start}-${end} de ${props.totalItems}`
})

function goToPage(page: number) {
  if (props.pending || page < 1 || page > props.totalPages || page === props.page) {
    return
  }

  emit('change', page)
}
</script>

<template>
  <div class="vtx-admin-pagination">
    <div>
      <p class="text-[0.68rem] font-semibold tracking-[0.24em] text-dimmed uppercase">
        Navegación
      </p>
      <p class="mt-2 text-sm text-toned">
        {{ itemRangeLabel }}
      </p>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-2">
      <BaseTertiaryButton size="sm" :disabled="pending || page <= 1" @click="goToPage(page - 1)">
        Anterior
      </BaseTertiaryButton>

      <template v-for="pageNumber in pageNumbers" :key="`${pageNumber}`">
        <span v-if="pageNumber === 'ellipsis'" class="vtx-admin-pagination__ellipsis">
          ···
        </span>
        <BaseSecondaryButton
          v-else
          size="sm"
          :disabled="pending"
          class="min-w-10"
          :class="pageNumber === page && 'vtx-admin-pagination__page--active'"
          @click="goToPage(pageNumber)"
        >
          {{ pageNumber }}
        </BaseSecondaryButton>
      </template>

      <BaseTertiaryButton size="sm" :disabled="pending || page >= totalPages" @click="goToPage(page + 1)">
        Siguiente
      </BaseTertiaryButton>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.vtx-admin-pagination {
  @apply flex flex-col gap-4 rounded-[1.6rem] border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg-elevated) 54%, transparent);
}

.vtx-admin-pagination__ellipsis {
  @apply inline-flex min-w-8 items-center justify-center text-sm text-dimmed;
}

.vtx-admin-pagination__page--active {
  border-color: color-mix(in srgb, var(--color-auric-400) 50%, transparent);
  background: color-mix(in srgb, var(--color-auric-400) 14%, transparent);
}
</style>
