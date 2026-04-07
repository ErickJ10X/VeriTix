import type { MaybeRef } from 'vue'
import type {
  CurrencyCode,
  EventCatalogDetail,
  EventCatalogFilters,
  EventCatalogItem,
  GenreOption,
  PaginatedResponse,
  VenueOption,
} from '~/types'

interface EventListApiItem {
  id: string
  name: string
  eventDate: string | Date
  imageUrl: string | null
  currency: string
  venue: {
    id: string
    name: string
    city: string
  }
  format: {
    id: string
    name: string
  } | null
}

interface EventDetailApiItem {
  id: string
  name: string
  description: string | null
  eventDate: string | Date
  doorsOpenTime: string | Date | null
  startSale: string | Date | null
  endSale: string | Date | null
  maxCapacity: number
  imageUrl: string | null
  currency: string
  creatorId: string
  venue: {
    id: string
    name: string
    slug: string
    address: string
    city: string
    state: string | null
    country: string
    capacity: number | null
    type: string
    imageUrl: string | null
  }
  format: {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
  } | null
  genres: Array<{
    id: string
    name: string
    slug: string
  }>
}

function toIsoString(value: string | Date | null | undefined): string | null {
  if (!value) {
    return null
  }

  return typeof value === 'string' ? value : value.toISOString()
}

function normalizeFilters(raw?: Partial<EventCatalogFilters>): EventCatalogFilters {
  return {
    search: raw?.search?.trim() ?? '',
    genreId: raw?.genreId?.trim() ?? '',
    city: raw?.city?.trim() ?? '',
  }
}

function buildFallbackImage(seed: string): string {
  return `https://picsum.photos/seed/${seed}/900/1200`
}

function buildEventFallbackImage(eventId: string): string {
  return buildFallbackImage(`veritix-event-${eventId}`)
}

function normalizeCurrencyCode(value: string): CurrencyCode {
  if (value === 'USD' || value === 'EUR' || value === 'COP') {
    return value
  }

  return 'EUR'
}

function mapEventListItem(item: EventListApiItem): EventCatalogItem {
  return {
    id: item.id,
    name: item.name,
    dateISO: toIsoString(item.eventDate) ?? new Date().toISOString(),
    imageUrl: item.imageUrl ?? buildEventFallbackImage(item.id),
    currency: normalizeCurrencyCode(item.currency),
    venue: item.venue,
    format: item.format,
  }
}

function mapEventDetail(item: EventDetailApiItem): EventCatalogDetail {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    dateISO: toIsoString(item.eventDate) ?? new Date().toISOString(),
    doorsOpenISO: toIsoString(item.doorsOpenTime),
    startSaleISO: toIsoString(item.startSale),
    endSaleISO: toIsoString(item.endSale),
    maxCapacity: item.maxCapacity,
    imageUrl: item.imageUrl ?? buildEventFallbackImage(item.id),
    currency: normalizeCurrencyCode(item.currency),
    creatorId: item.creatorId,
    venue: item.venue,
    format: item.format,
    genres: item.genres,
  }
}

export function usePublicEvents(filters?: MaybeRef<Partial<EventCatalogFilters> | undefined>) {
  const apiRequest = useApiRequest()

  const normalizedFilters = computed(() => {
    return normalizeFilters(unref(filters))
  })

  const cacheKey = computed(() => {
    return `veritix-public-events:${JSON.stringify(normalizedFilters.value)}`
  })

  return useAsyncData<PaginatedResponse<EventCatalogItem>>(
    cacheKey,
    async () => {
      const response = await apiRequest<PaginatedResponse<EventListApiItem>>('/events', {
        method: 'GET',
        query: {
          page: 1,
          limit: 24,
          city: normalizedFilters.value.city || undefined,
          genreId: normalizedFilters.value.genreId || undefined,
          search: normalizedFilters.value.search || undefined,
        },
      })

      return {
        data: response.data.map(mapEventListItem),
        meta: response.meta,
      }
    },
    {
      default: () => ({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 24,
          totalPages: 0,
        },
      }),
      watch: [normalizedFilters],
      server: true,
    },
  )
}

export function usePublicEvent(id: MaybeRef<string>) {
  const apiRequest = useApiRequest()

  const eventId = computed(() => unref(id))

  return useAsyncData<EventCatalogDetail>(
    () => `veritix-public-event:${eventId.value}`,
    async () => {
      const response = await apiRequest<EventDetailApiItem>(`/events/${eventId.value}`, {
        method: 'GET',
      })

      return mapEventDetail(response)
    },
    {
      watch: [eventId],
      server: true,
    },
  )
}

export function useEventCatalogFilters() {
  const apiRequest = useApiRequest()

  const genres = useAsyncData<GenreOption[]>(
    'veritix-event-genres',
    async () => {
      return apiRequest<GenreOption[]>('/genres', {
        method: 'GET',
      })
    },
    {
      default: () => [],
      server: true,
    },
  )

  const venues = useAsyncData<VenueOption[]>(
    'veritix-event-venues',
    async () => {
      const response = await apiRequest<PaginatedResponse<VenueOption>>('/venues', {
        method: 'GET',
      })

      return response.data
    },
    {
      default: () => [],
      server: true,
    },
  )

  const cities = computed(() => {
    return [...new Set((venues.data.value ?? []).map(venue => venue.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
  })

  return {
    genres,
    cities,
  }
}
