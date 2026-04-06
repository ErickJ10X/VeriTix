import type { UserRole } from '~~/shared/types'
import type {
  CurrencyCode,
  EventFormatDetail,
  EventGenreSummary,
  EventVenueDetail,
  EventVenueSummary,
  GenreOption,
} from './domain'

export interface AdminOption {
  id: string
  name: string
}

export interface AdminEventRecord {
  id: string
  name: string
  eventDate: string
  status: string
  imageUrl: string | null
  currency: CurrencyCode
  venue: EventVenueSummary
  format: AdminOption | null
}

export interface AdminEventDetail {
  id: string
  name: string
  description: string | null
  eventDate: string
  doorsOpenTime: string | null
  startSale: string | null
  endSale: string | null
  maxCapacity: number
  status: string
  imageUrl: string | null
  currency: CurrencyCode
  creatorId: string
  venue: EventVenueDetail
  format: EventFormatDetail | null
  genres: EventGenreSummary[]
}

export interface AdminEventPayload {
  name: string
  description?: string
  eventDate: string
  doorsOpenTime?: string
  startSale?: string
  endSale?: string
  maxCapacity: number
  venueId: string
  imageUrl?: string
  currency?: CurrencyCode
  formatId?: string
  genreIds?: string[]
}

export interface AdminUserRecord {
  id: string
  email: string
  phone: string
  name: string
  lastName: string
  role: UserRole
  avatarUrl: string | null
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminCreateUserPayload {
  email: string
  phone: string
  name: string
  lastName: string
  password: string
  role?: UserRole
}

export interface AdminUpdateUserPayload {
  email?: string
  phone?: string
  name?: string
  lastName?: string
  avatarUrl?: string
  role?: UserRole
  isActive?: boolean
  emailVerified?: boolean
}

export interface AdminArtistRecord {
  id: string
  name: string
  slug: string
  bio: string | null
  imageUrl: string | null
  country: string | null
  website: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  genres: GenreOption[]
}

export interface AdminArtistPayload {
  name: string
  slug: string
  bio?: string
  imageUrl?: string
  country?: string
  website?: string
  isActive?: boolean
  genreIds?: string[]
}
