import type { Event } from '~/types'

export function formatEventLocation(event: Event): string {
  return `${event.city} - ${event.venue}`
}
