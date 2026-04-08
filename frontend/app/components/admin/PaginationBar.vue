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

    <div class="flex flex-wrap items-center justify-end">
      <UPagination
        :page="page"
        :total="totalItems"
        :items-per-page="pageSize"
        :disabled="pending"
        size="sm"
        color="neutral"
        variant="outline"
        active-variant="soft"
        show-edges
        @update:page="goToPage"
      />
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-pagination {
  @apply flex flex-col gap-4 rounded-[1.6rem] border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5;
  border-color: color-mix(in srgb, var(--ui-border-accented) 18%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg-elevated) 54%, transparent);
}

</style>
