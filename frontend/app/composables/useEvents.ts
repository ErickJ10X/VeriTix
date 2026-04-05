import type { MaybeRef } from 'vue'
import type { Event, SearchParams } from '~/types'
import { mockEvents } from '~/data/mock-events'

function toSafeDate(value: string): number {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function normalizeString(value?: string): string {
  return value?.trim().toLowerCase() ?? ''
}

function normalizeParams(raw?: Partial<SearchParams>): SearchParams {
  return {
    query: raw?.query?.trim() ?? '',
    genre: raw?.genre?.trim() ?? '',
  }
}

function filterEvents(events: Event[], params: SearchParams): Event[] {
  const query = normalizeString(params.query)
  const genre = normalizeString(params.genre)

  return events.filter((event) => {
    if (genre && event.genre !== genre) {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = `${event.artist} ${event.venue} ${event.city} ${event.genre}`.toLowerCase()
    return haystack.includes(query)
  })
}

export function useEvents(params?: MaybeRef<Partial<SearchParams> | undefined>) {
  const normalizedParams = computed<SearchParams>(() => {
    return normalizeParams(unref(params))
  })

  const cacheKey = computed(() => {
    return `veritix-events:${JSON.stringify(normalizedParams.value)}`
  })

  return useAsyncData<Event[]>(
    cacheKey,
    async () => {
      const ordered = mockEvents.toSorted((a, b) => {
        return toSafeDate(a.dateISO) - toSafeDate(b.dateISO)
      })

      return filterEvents(ordered, normalizedParams.value)
    },
    {
      default: () => [],
      watch: [normalizedParams],
      server: true,
    },
  )
}
