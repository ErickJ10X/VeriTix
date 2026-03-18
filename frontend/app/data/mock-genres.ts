import type { Genre } from '~/types'

export const mockGenres: Genre[] = [
  {
    id: 'genre-rock',
    slug: 'rock',
    name: 'Rock',
    icon: 'R',
    accent: '#ECB04D',
  },
  {
    id: 'genre-electronica',
    slug: 'electronica',
    name: 'Electronica',
    icon: 'E',
    accent: '#1480BC',
  },
  {
    id: 'genre-clasica',
    slug: 'clasica',
    name: 'Clasica',
    icon: 'C',
    accent: '#B39479',
  },
  {
    id: 'genre-jazz',
    slug: 'jazz',
    name: 'Jazz',
    icon: 'J',
    accent: '#039B78',
  },
  {
    id: 'genre-indie',
    slug: 'indie',
    name: 'Indie',
    icon: 'I',
    accent: '#CC4A58',
  },
]
