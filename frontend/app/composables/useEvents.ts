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
    dateFrom: raw?.dateFrom?.trim() ?? '',
    dateTo: raw?.dateTo?.trim() ?? '',
    city: raw?.city?.trim() ?? '',
  }
}

function filterEvents(events: Event[], params: SearchParams): Event[] {
  const query = normalizeString(params.query)
  const genre = normalizeString(params.genre)
  const city = normalizeString(params.city)
  const dateFrom = params.dateFrom ? toSafeDate(params.dateFrom) : 0
  const dateTo = params.dateTo ? toSafeDate(`${params.dateTo}T23:59:59`) : Number.MAX_SAFE_INTEGER

  return events.filter((event) => {
    const eventDate = toSafeDate(event.dateISO)

    if (genre && event.genre !== genre) {
      return false
    }

    if (city && normalizeString(event.city) !== city) {
      return false
    }

    if (eventDate < dateFrom || eventDate > dateTo) {
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

      return Promise.resolve(filterEvents(ordered, normalizedParams.value))
    },
    {
      default: () => [],
      watch: [normalizedParams],
      server: true,
    },
  )
}
