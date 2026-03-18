import type { SearchParams } from '~/types'

type SearchFilters = Omit<SearchParams, 'query'>

export function useEventSearch() {
  const query = useState<string>('veritix-search-query', () => '')
  const filters = useState<SearchFilters>('veritix-search-filters', () => {
    return {
      genre: '',
      dateFrom: '',
      dateTo: '',
      city: '',
    }
  })

  const params = computed<SearchParams>(() => {
    return {
      query: query.value,
      genre: filters.value.genre,
      dateFrom: filters.value.dateFrom,
      dateTo: filters.value.dateTo,
      city: filters.value.city,
    }
  })

  const { data, pending, error, refresh } = useEvents(params)

  const results = computed(() => {
    return data.value ?? []
  })

  async function execute() {
    await refresh()
  }

  function resetFilters() {
    query.value = ''
    filters.value = {
      genre: '',
      dateFrom: '',
      dateTo: '',
      city: '',
    }
  }

  return {
    query,
    filters,
    results,
    pending,
    error,
    execute,
    resetFilters,
  }
}
