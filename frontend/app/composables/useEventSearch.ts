import type { SearchParams } from '~/types'

export function useEventSearch() {
  const query = useState<string>('veritix-search-query', () => '')
  const genre = useState<string>('veritix-search-genre', () => '')

  const params = computed<SearchParams>(() => {
    return {
      query: query.value,
      genre: genre.value,
    }
  })

  const { data, pending } = useEvents(params)

  const results = computed(() => {
    return data.value ?? []
  })

  return {
    query,
    genre,
    results,
    pending,
  }
}
