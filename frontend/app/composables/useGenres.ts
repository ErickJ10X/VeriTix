import type { Genre } from '~/types'
import { mockGenres } from '~/data/mock-genres'

export function useGenres() {
  return useAsyncData<Genre[]>(
    'veritix-genres',
    async () => {
      return Promise.resolve(mockGenres)
    },
    {
      default: () => [],
      server: true,
    },
  )
}
