export type CurrencyCode = 'USD' | 'EUR' | 'COP'

export interface Money {
  amount: number
  currency: CurrencyCode
}

export type EventStatus = 'available' | 'few_left' | 'sold_out'

export interface Event {
  id: string
  slug: string
  artist: string
  venue: string
  city: string
  genre: string
  dateISO: string
  cover: string
  price: Money
  availability: EventStatus
}

export interface Genre {
  id: string
  slug: string
  name: string
  icon: string
  accent: string
}

export interface SearchParams {
  query: string
  genre: string
  dateFrom: string
  dateTo: string
  city: string
}
